"""
Simple email sending for password reset. Uses SMTP when configured; otherwise logs (dev).
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Send password reset email. Returns True if sent (or skipped in dev), False on SMTP error.
    When EMAIL_ENABLED is False, only logs the link and returns True.
    """
    subject = "Nexus — Reset your password"
    body = f"""Hello,

You requested a password reset for your Nexus account.

Click the link below to set a new password (valid for 1 hour):

{reset_link}

If you didn't request this, you can ignore this email.

— Nexus
"""
    if not getattr(settings, "EMAIL_ENABLED", False) or not settings.SMTP_HOST:
        logger.info("Email not configured; reset link for %s: %s", to_email, reset_link)
        return True
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USER or "noreply@nexus"
        msg["To"] = to_email
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], to_email, msg.as_string())
        logger.info("Password reset email sent to %s", to_email)
        return True
    except Exception as e:
        logger.exception("Failed to send reset email: %s", e)
        return False
