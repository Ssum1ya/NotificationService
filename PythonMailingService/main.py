from kafka import KafkaConsumer
import json

from MailService import MailService

# consumerExample
consumer = KafkaConsumer(
    'notifications-email', # пример с отправкой mail
    bootstrap_servers=['localhost:9092'],
    group_id='consumer-group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

for message in consumer:
    notification = message.value
    MailService.send_message(notification['userCallList'], notification['message'])
    #print(f"Получено сообщение: {notification}")