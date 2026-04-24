
# нужен session.session файл для авторизации
# где то локально сделайте маленький скрипт с авторизацией telethon с вашим ботом там или как у вас
# создастся session.session файл, его кидаете в папку с этим скриптом
# файл (сессия) должен называтся именно session.session, ибо его ожидает телефон в этой папке
# также закидываете api_id и api_hash в .env 
from kafka import KafkaConsumer
from dotenv import load_dotenv
from BulkSender import *
import json
import os

print('tg-client started')

load_dotenv()
id = int(os.environ['TELEGRAM_API_ID'])
hash = os.environ['TELEGRAM_API_HASH']

# наверное можно сообщение тоже через кафку передавать но хз
message = "Lorem Ipsum"

# https://github.com/LonamiWebs/Telethon/issues/4730#issuecomment-3765009509
mobile_device = {
    "device_model": "Pixel 5",
    "system_version": "11",
    "app_version": "8.4.1",
    "lang_code": "en",
    "system_lang_code": "en-US",
}

async def main():
    client = TelegramClient(
        'session',
        id,
        hash,
        device_model=mobile_device["device_model"],
        system_version=mobile_device["system_version"],
        app_version=mobile_device["app_version"],
        lang_code=mobile_device["lang_code"],
        system_lang_code=mobile_device["system_lang_code"],
    )
    await client.start()
    print('client_started')

    consumer = KafkaConsumer(
        'notifications-telegram', # пример с отправкой mail
        bootstrap_servers=['localhost:29092'],
        group_id='consumer-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    print('kafka-started')

    sender = BulkSender(client)
    for message in consumer:
        
        notification = message.value
        print(message)

        subj = notification['fromFullName'] + " " +  notification['fromFullPosition'] + " " + notification['fromDepartmentName']
        message = subj + "\n" + notification['message']
        target = notification['usernameList']

        await sender.send(target, message)


asyncio.run(main())
