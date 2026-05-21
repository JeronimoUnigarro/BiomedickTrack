from email.message import EmailMessage
import smtplib
import ssl

from app.core.config import settings


class EmailService:
    def __init__(self) -> None:
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.secure = settings.smtp_secure
        self.user = settings.smtp_user
        self.password = settings.smtp_pass
        self.sender = settings.smtp_from or settings.smtp_user

    @property
    def is_configured(self) -> bool:
        return bool(self.host and self.port and self.user and self.password and self.sender)

    def send_two_factor_code(self, to_email: str, code: str, expires_minutes: int) -> None:
        if not self.is_configured:
            raise RuntimeError("SMTP no esta configurado")

        message = EmailMessage()
        message["Subject"] = "Codigo de verificacion BiomedicTrack"
        message["From"] = self.sender
        message["To"] = to_email
        message.set_content(
            "\n".join(
                [
                    "Hola,",
                    "",
                    f"Tu codigo de verificacion para BiomedicTrack es: {code}",
                    f"Este codigo vence en {expires_minutes} minutos.",
                    "",
                    "Si no intentaste iniciar sesion, ignora este correo.",
                ]
            )
        )

        context = ssl.create_default_context()
        if self.secure:
            with smtplib.SMTP_SSL(self.host, self.port, context=context) as smtp:
                smtp.login(self.user, self.password)
                smtp.send_message(message)
            return

        with smtplib.SMTP(self.host, self.port) as smtp:
            smtp.starttls(context=context)
            smtp.login(self.user, self.password)
            smtp.send_message(message)

    def send_password_recovery(self, to_email: str, reset_url: str, expires_minutes: int) -> None:
        if not self.is_configured:
            raise RuntimeError("SMTP no esta configurado")

        message = EmailMessage()
        message["Subject"] = "Recuperacion de contrasena BiomedicTrack"
        message["From"] = self.sender
        message["To"] = to_email
        message.set_content(
            "\n".join(
                [
                    "Hola,",
                    "",
                    "Recibimos una solicitud para recuperar tu contrasena de BiomedicTrack.",
                    f"Abre este enlace para crear una nueva contrasena: {reset_url}",
                    f"El enlace vence en {expires_minutes} minutos.",
                    "",
                    "Si no solicitaste este cambio, ignora este correo.",
                ]
            )
        )

        context = ssl.create_default_context()
        if self.secure:
            with smtplib.SMTP_SSL(self.host, self.port, context=context) as smtp:
                smtp.login(self.user, self.password)
                smtp.send_message(message)
            return

        with smtplib.SMTP(self.host, self.port) as smtp:
            smtp.starttls(context=context)
            smtp.login(self.user, self.password)
            smtp.send_message(message)

    def send_maintenance_alert(
        self,
        to_email: str,
        equipo_nombre: str,
        proximo_mantenimiento: str,
        prioridad: str,
    ) -> None:
        if not self.is_configured:
            raise RuntimeError("SMTP no esta configurado")

        message = EmailMessage()
        message["Subject"] = f"Alerta de mantenimiento - {equipo_nombre}"
        message["From"] = self.sender
        message["To"] = to_email
        message.set_content(
            "\n".join(
                [
                    "Hola,",
                    "",
                    "BiomedicTrack genero una alerta de mantenimiento.",
                    f"Equipo: {equipo_nombre}",
                    f"Fecha programada: {proximo_mantenimiento}",
                    f"Prioridad: {prioridad}",
                    "",
                    "Por favor revisa el modulo de alertas y programa la atencion correspondiente.",
                ]
            )
        )

        context = ssl.create_default_context()
        if self.secure:
            with smtplib.SMTP_SSL(self.host, self.port, context=context) as smtp:
                smtp.login(self.user, self.password)
                smtp.send_message(message)
            return

        with smtplib.SMTP(self.host, self.port) as smtp:
            smtp.starttls(context=context)
            smtp.login(self.user, self.password)
            smtp.send_message(message)
