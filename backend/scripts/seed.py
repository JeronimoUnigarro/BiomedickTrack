from datetime import date, datetime, timedelta
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.modules.alertas.models.alerta import Alerta
from app.modules.bitacora.models.bitacora import Bitacora
from app.modules.equipos.models.equipo import Equipo
from app.modules.mantenimientos.models.mantenimiento import Mantenimiento
from app.modules.usuarios.models.usuario import Usuario
from app.shared.enums import (
    CriticidadEquipo,
    EstadoEquipo,
    PrioridadAlerta,
    RolUsuario,
    TipoAlerta,
    TipoMantenimiento,
)


def run() -> None:
    db = SessionLocal()
    try:
        if db.query(Usuario).count() > 0:
            print("Seed omitido: la base ya tiene datos.")
            return

        admin = Usuario(
            email="admin@hospital.com",
            nombre="Maria",
            apellido="Gonzalez",
            telefono="+57 310 123 4567",
            rol=RolUsuario.GERENCIA,
            password_hash=hash_password("Admin123"),
        )
        engineer = Usuario(
            email="ingeniero@hospital.com",
            nombre="Carlos",
            apellido="Rodriguez",
            telefono="+57 315 987 6543",
            rol=RolUsuario.BIOMEDICO,
            password_hash=hash_password("Ingeniero123"),
        )
        db.add_all([admin, engineer])
        db.flush()

        equipos = [
            Equipo(
                nombre="Ventilador Mecanico Hamilton-C6",
                marca="Hamilton Medical",
                modelo="C6",
                serie="HM-C6-2023-001",
                fabricante="Hamilton Medical AG",
                pais_origen="Suiza",
                ano_fabricacion=2023,
                fecha_adquisicion=date(2023, 3, 15),
                costo_adquisicion=85000000,
                proveedor="MedEquip Colombia SAS",
                ubicacion="UCI - Piso 3",
                area="Unidad de Cuidados Intensivos",
                responsable="Dr. Juan Perez",
                estado=EstadoEquipo.activo,
                criticidad=CriticidadEquipo.alta,
                especificaciones={"voltaje": "110-240V AC", "frecuencia": "50/60 Hz", "potencia": "150W"},
                accesorios=["Circuito respiratorio", "Humidificador", "Cable de poder"],
                observaciones="Requiere calibracion trimestral",
                ultimo_mantenimiento=date(2026, 3, 1),
                proximo_mantenimiento=date(2026, 6, 1),
            ),
            Equipo(
                nombre="Monitor de Signos Vitales Philips IntelliVue",
                marca="Philips",
                modelo="MX550",
                serie="PHI-MX550-2024-078",
                fabricante="Philips Healthcare",
                pais_origen="Paises Bajos",
                ano_fabricacion=2024,
                fecha_adquisicion=date(2024, 1, 20),
                costo_adquisicion=45000000,
                proveedor="Philips Colombia",
                ubicacion="Urgencias - Piso 1",
                area="Sala de Urgencias",
                responsable="Dra. Ana Lopez",
                estado=EstadoEquipo.activo,
                criticidad=CriticidadEquipo.alta,
                especificaciones={"voltaje": "100-240V AC", "frecuencia": "50/60 Hz"},
                accesorios=["Manguito NIBP", "Cable ECG", "Sensor SpO2"],
                ultimo_mantenimiento=date(2026, 2, 15),
                proximo_mantenimiento=date.today() + timedelta(days=20),
            ),
            Equipo(
                nombre="Autoclave Tuttnauer 3870ELV",
                marca="Tuttnauer",
                modelo="3870ELV",
                serie="TUT-3870-2023-012",
                fabricante="Tuttnauer Europe B.V.",
                pais_origen="Paises Bajos",
                ano_fabricacion=2023,
                fecha_adquisicion=date(2023, 5, 18),
                costo_adquisicion=35000000,
                proveedor="SterEquip Colombia",
                ubicacion="Central de Esterilizacion",
                area="Esterilizacion",
                responsable="Enfermera Jefe Maria Castro",
                estado=EstadoEquipo.inactivo,
                criticidad=CriticidadEquipo.baja,
                especificaciones={"voltaje": "220V AC", "potencia": "3500W"},
                accesorios=["Bandejas de acero inoxidable", "Manual de operacion"],
                observaciones="Fuera de servicio por falla en valvula de seguridad",
                ultimo_mantenimiento=date(2026, 3, 28),
            ),
        ]
        db.add_all(equipos)
        db.flush()

        mantenimiento = Mantenimiento(
            equipo_id=equipos[0].id,
            tipo=TipoMantenimiento.preventivo,
            fecha=date(2026, 3, 1),
            tecnico_responsable="Ing. Carlos Rodriguez",
            descripcion="Mantenimiento preventivo trimestral",
            observaciones="Calibracion de sensores y pruebas de funcionamiento.",
            repuestos=["Filtro HEPA", "Sensor de oxigeno"],
            costo=2500000,
            duracion=3,
            estado_anterior=EstadoEquipo.activo,
            estado_posterior=EstadoEquipo.activo,
            created_by_id=engineer.id,
            created_by_nombre="Carlos Rodriguez",
        )
        db.add(mantenimiento)

        db.add_all(
            [
                Alerta(
                    equipo_id=equipos[2].id,
                    tipo=TipoAlerta.equipo_inactivo,
                    mensaje="Equipo inactivo - Requiere reparacion urgente",
                    prioridad=PrioridadAlerta.alta,
                    fecha=datetime.utcnow(),
                ),
                Alerta(
                    equipo_id=equipos[1].id,
                    tipo=TipoAlerta.mantenimiento_proximo,
                    mensaje=f"Mantenimiento preventivo proximo ({equipos[1].proximo_mantenimiento.isoformat()})",
                    prioridad=PrioridadAlerta.media,
                    fecha=datetime.utcnow(),
                ),
            ]
        )

        db.add(
            Bitacora(
                equipo_id=equipos[0].id,
                usuario="Carlos Rodriguez",
                accion="Mantenimiento Preventivo",
                detalles="Se realizo mantenimiento preventivo trimestral.",
                firma_digital="CR-2026-03-01-1030",
            )
        )

        db.commit()
        print("Seed completado.")
        print("Gerencia: admin@hospital.com / Admin123")
        print("Biomedico: ingeniero@hospital.com / Ingeniero123")
        print("Codigo 2FA local: 123456")
    finally:
        db.close()


if __name__ == "__main__":
    run()
