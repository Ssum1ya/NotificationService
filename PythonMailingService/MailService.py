import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import SENDER_EMAIL, PASSWORD

#TODO: сделать логирование
class MailService:

    def send_message(employees_emails: list, mess: str, subj: str):
        for employee in employees_emails:
            # Создание сообщения
            message = MIMEMultipart()
            message["From"] = SENDER_EMAIL
            message["To"] = employee
            message["Subject"] = subj

            body = mess # ?
            message.attach(MIMEText(body, "plain"))

            # Отправка через SSL (порт 465)
            try:
                server = smtplib.SMTP("smtp.gmail.com", 587)
                server.starttls() # Шифрование соединения
                server.login(SENDER_EMAIL, PASSWORD)
                server.sendmail(SENDER_EMAIL, employee, message.as_string())
                server.quit()
                print("Сообщение успешно отправлено")
            except Exception as e:
                print(f"Ошибка отправления сообщения: {e}")