import vk_api
from vk_api.utils import get_random_id
from vk_api.longpoll import VkLongPoll, VkEventType
from config import TOKEN, PASSWORD
# import pymysql.cursors

import json

from kafka import KafkaConsumer

print('Vk client started')

vk_session = vk_api.VkApi(token=TOKEN)
vk = vk_session.get_api()
longpoll = VkLongPoll(vk_session)

def sender(user_id, text):
    vk.messages.send(
        user_id= user_id,
        message=text,
        random_id=get_random_id()
    )

    print(f"Сообщение отправлено пользователю (ID: {user_id})")

# def get_connection():
#     connection = pymysql.connect(
#     host='localhost', # нужно будет поменять подключение
#     port=3306,
#     user='root',
#     password='',
#     database='botlogs',
#     charset='utf8mb4',
#     cursorclass=pymysql.cursors.DictCursor
# )
#     return connection

consumer = KafkaConsumer(
    'notifications-vk',
    bootstrap_servers=['kafka:9092'],
    group_id='consumer-group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

for message in consumer:
    notification = message.value
    print(f"Получено сообщение: {notification}")

    subj = notification['fromFullName'] + ", " +  notification['fromFullPosition'] + ", " + notification['fromDepartmentName']
    message = notification['message']
    for id in notification['usernameList']:
        sender(id, subj + ": " + message) 


# sender('680045495', 'VK-client started')

# def add_to_database(id, datetime, message):
#     connection = get_connection()
#     cursor = connection.cursor()
#     sql = f"INSERT INTO logs (user_id, datetime, message) VALUES ({id}, {datetime}, {message})"
#     cursor.execute(sql)
#     connection.commit()
#     connection.close()
# print("Connected")
# for event in longpoll.listen():
#     if event.type == VkEventType.MESSAGE_NEW:
#         if event.to_me:
#             msg = event.text
#             id = event.user_id
#             datetime = event.datetime
#             add_to_database(id, datetime, msg)
#             sender(id, "Сообщение успешно записано")
#             print("Connected")

#sender('712040972', 'KTH4RFGGWJ354BNFSL!!DSJDG465NFFHEPDE')