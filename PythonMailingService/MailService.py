import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import SENDER_EMAIL, PASSWORD

#TODO: сделать логирование
class MailService:

    def send_message(employees_emails: list, mess: str):
        for employee in employees_emails:
            # Создание сообщения
            message = MIMEMultipart()
            message["From"] = SENDER_EMAIL
            message["To"] = employee['usernameId']
            message["Subject"] = mess # ?

            body = mess # ?
            message.attach(MIMEText(body, "plain"))

            # Отправка через SSL (порт 465)
            try:
                server = smtplib.SMTP("smtp.gmail.com", 587)
                server.starttls() # Шифрование соединения
                server.login(SENDER_EMAIL, PASSWORD)
                server.sendmail(SENDER_EMAIL, employee['usernameId'], message.as_string())
                server.quit()
                print("Успех!")
            except Exception as e:
                print(f"Снова ошибка: {e}")