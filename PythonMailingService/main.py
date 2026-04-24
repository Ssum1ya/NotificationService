from kafka import KafkaConsumer
import json

from MailService import MailService

print('mail-client started')
# consumerExample
consumer = KafkaConsumer(
    'notifications-email', # пример с отправкой mail
    bootstrap_servers=['kafka:9092'],
    group_id='consumer-group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

for message in consumer:
    notification = message.value
    print(f"Получено сообщение: {notification}")
    subj = notification['fromFullName'] + " " +  notification['fromFullPosition'] + " " + notification['fromDepartmentName']
    MailService.send_message(notification['usernameList'], notification['message'], subj) 