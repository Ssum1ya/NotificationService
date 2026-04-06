import asyncio
from telethon import TelegramClient

class BulkSender:
    def __init__(self, client: TelegramClient):
        self.client = client

    async def send(self, usernames: list[str], message: str):
        tasks = [self._send_one(username, message) for username in usernames]
        await asyncio.gather(*tasks)

    async def _send_one(self, username: str, message: str):
        try:
            await self.client.send_message(username, message)
            print(f"sent to {username}")
        except Exception as e:
            print(f"failed sending to {username}. err: {e}")