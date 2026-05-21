from datetime import date, datetime
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.email import EmailService
from app.modules.alertas.models.alerta import Alerta
from app.modules.alertas.schemas.alerta_schema import alerta_to_read
from app.modules.equipos.models.equipo import Equipo
from app.modules.equipos.services.maintenance_policy import next_maintenance_date
from app.modules.usuarios.models.usuario import Usuario
from app.shared.enums import CriticidadEquipo, EstadoEquipo, PrioridadAlerta, TipoAlerta
from app.shared.exceptions import not_found


class AlertaService:
    def __init__(self, db: Session):
        self.db = db

    def list(self):
        self.sync_all()
        self.db.commit()
        alertas = self.db.scalars(
            select(Alerta).options(joinedload(Alerta.equipo)).order_by(Alerta.fecha.desc())
        ).all()
        return [alerta_to_read(alerta) for alerta in alertas]

    def mark_read(self, alerta_id: str):
        alerta = self.db.get(Alerta, alerta_id)
        if not alerta:
            raise not_found("Alerta")
        alerta.leida = True
        self.db.commit()
        self.db.refresh(alerta)
        return alerta_to_read(alerta)

    def mark_all_read(self):
        self.db.query(Alerta).update({"leida": True})
        self.db.commit()
        return {"updated": True}

    def sync_equipo_alertas(self, equipo: Equipo):
        base_date = equipo.ultimo_mantenimiento or equipo.fecha_adquisicion
        expected_next = next_maintenance_date(base_date, equipo.criticidad)
        if equipo.proximo_mantenimiento != expected_next:
            equipo.proximo_mantenimiento = expected_next

        if equipo.estado == EstadoEquipo.inactivo:
            self._create_if_missing(
                equipo,
                TipoAlerta.equipo_inactivo,
                "Equipo inactivo - Requiere revision operacional",
                PrioridadAlerta.alta,
            )
        if equipo.criticidad == CriticidadEquipo.alta:
            self._create_if_missing(
                equipo,
                TipoAlerta.equipo_critico,
                "Equipo critico - Verificar disponibilidad y mantenimiento",
                PrioridadAlerta.media,
            )
        if equipo.proximo_mantenimiento:
            today = date.today()
            days_left = (equipo.proximo_mantenimiento - today).days

            if days_left <= 0 and equipo.estado != EstadoEquipo.mantenimiento:
                equipo.estado = EstadoEquipo.mantenimiento

            if days_left < 0:
                self._create_if_missing(
                    equipo,
                    TipoAlerta.mantenimiento_vencido,
                    f"Mantenimiento vencido ({equipo.proximo_mantenimiento.isoformat()})",
                    PrioridadAlerta.alta,
                    maintenance_date=equipo.proximo_mantenimiento,
                )
            elif days_left <= 10:
                self._create_if_missing(
                    equipo,
                    TipoAlerta.mantenimiento_proximo,
                    f"Mantenimiento preventivo proximo ({equipo.proximo_mantenimiento.isoformat()})",
                    self._maintenance_priority(equipo),
                    maintenance_date=equipo.proximo_mantenimiento,
                )
            else:
                self._resolve_maintenance_alerts(equipo)

    def sync_all(self):
        equipos = self.db.scalars(select(Equipo)).all()
        for equipo in equipos:
            self.sync_equipo_alertas(equipo)

    def _create_if_missing(
        self,
        equipo: Equipo,
        tipo: TipoAlerta,
        mensaje: str,
        prioridad: PrioridadAlerta,
        maintenance_date: date | None = None,
    ):
        exists_query = select(Alerta).where(
            Alerta.equipo_id == equipo.id,
            Alerta.tipo == tipo,
        )
        if maintenance_date is not None:
            exists_query = exists_query.where(Alerta.mensaje.contains(maintenance_date.isoformat()))

        exists = self.db.scalar(exists_query)
        if exists:
            self._refresh_existing_alert(exists, mensaje, prioridad)
            return
        alerta = Alerta(
            equipo_id=equipo.id,
            tipo=tipo,
            mensaje=mensaje,
            prioridad=prioridad,
            fecha=datetime.utcnow(),
        )
        self.db.add(alerta)
        self._notify_if_maintenance_alert(equipo, tipo, prioridad)

    def _refresh_existing_alert(self, alerta: Alerta, mensaje: str, prioridad: PrioridadAlerta):
        changed = False
        if alerta.mensaje != mensaje:
            alerta.mensaje = mensaje
            changed = True
        if alerta.prioridad != prioridad:
            alerta.prioridad = prioridad
            changed = True
        if changed:
            alerta.fecha = datetime.utcnow()

    def _resolve_maintenance_alerts(self, equipo: Equipo):
        self.db.query(Alerta).filter(
            Alerta.equipo_id == equipo.id,
            Alerta.tipo.in_(
                [TipoAlerta.mantenimiento_proximo, TipoAlerta.mantenimiento_vencido]
            ),
            Alerta.leida.is_(False),
        ).update({"leida": True}, synchronize_session=False)

    def _maintenance_priority(self, equipo: Equipo) -> PrioridadAlerta:
        if equipo.criticidad == CriticidadEquipo.alta:
            return PrioridadAlerta.alta
        if equipo.criticidad == CriticidadEquipo.media:
            return PrioridadAlerta.media
        return PrioridadAlerta.baja

    def _notify_if_maintenance_alert(
        self,
        equipo: Equipo,
        tipo: TipoAlerta,
        prioridad: PrioridadAlerta,
    ):
        if tipo not in {TipoAlerta.mantenimiento_proximo, TipoAlerta.mantenimiento_vencido}:
            return

        usuarios = self.db.scalars(
            select(Usuario).where(Usuario.is_active.is_(True))
        ).all()
        recipients = [usuario.email for usuario in usuarios if usuario.email]
        if not recipients:
            return

        email_service = EmailService()
        for email in recipients:
            try:
                email_service.send_maintenance_alert(
                    email,
                    equipo.nombre,
                    equipo.proximo_mantenimiento.isoformat(),
                    prioridad.value,
                )
            except Exception as exc:
                print(f"[BiomedicTrack] No se pudo enviar alerta a {email}: {exc}")
