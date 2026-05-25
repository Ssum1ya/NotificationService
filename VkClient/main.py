import vk_api
from vk_api.utils import get_random_id
from vk_api.longpoll import VkLongPoll

from config import TOKEN

import psycopg2

import json
from datetime import datetime

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

def get_connection():
    connection = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="postgres",
        host="db",
        port="5432"
    )
    return connection

connection = get_connection()
cursor = None
try:
    cursor = connection.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100),
            datetime TIMESTAMP,
            message TEXT
        );
    ''')
except Exception as e:
    connection.rollback()
    print(f"Error: {e}") 
finally:
    connection.commit()
    if cursor:
        cursor.close()
    if connection:
        connection.close()

def add_to_database(id, datetime, message):
    connection = get_connection()
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO logs (user_id, datetime, message) 
            VALUES (%s, %s, %s)
        ''', ('user123', datetime, 'test message'))
    except Exception as e:
        connection.rollback()
        print(f"Error: {e}")    
    finally:
        connection.commit()
        if cursor:
            cursor.close()
        if connection:
            connection.close()

consumer = KafkaConsumer(
    'notifications-vk',
    bootstrap_servers=['kafka:9092'],
    group_id='consumer-group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

for message in consumer:
    now = datetime.now()
    notification = message.value
    print(f"Получено сообщение: {notification}")

    subj = notification['fromFullName'] + ", " +  notification['fromFullPosition'] + ", " + notification['fromDepartmentName']
    message = notification['message']
    for id in notification['usernameList']:
        add_to_database(id, now, message)
        sender(id, subj + ": " + message) 