from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        self.room_name = None

        start = 0

        for i in range(start, 100000000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return

        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) #有效时间1h

        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uid': player['uid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)

        players = cache.get(self.room_name)
        players.append({
            'uid': data['uid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        cache.set(self.room_name, players, 3600)
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",#type的值和接收函数的名字相同
                    'event': "create_player",
                    'uid': data['uid'],
                    'username': data['username'],
                    'photo':data['photo'],
                }
        )

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))

    async def move_to(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': "group_send_event",
                        'event': "move_to",
                        'uid': data['uid'],
                        'tx': data['tx'],
                        'ty': data['ty'],
                    }
                )

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': "group_send_event",
                        'event': "shoot_fireball",
                        'uid': data['uid'],
                        'tx': data['tx'],
                        'ty': data['ty'],
                        'ball_uid': data['ball_uid'],
                    }
                )

    async def attack(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': "group_send_event",
                        'event': "attack",
                        'uid': data['uid'],
                        'attackee_uid': data['attackee_uid'],
                        'x': data['x'],
                        'y': data['y'],
                        'angle': data['angle'],
                        'damage':data['damage'],
                        'ball_uid': data['ball_uid'],
                    }
                )

    async def blink(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': "group_send_event",
                        'event': "blink",
                        'uid': data['uid'],
                        'tx': data['tx'],
                        'ty': data['ty'],
                    }
                )

    async def message(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': "group_send_event",
                        'event': "message",
                        'uid': data['uid'],
                        'username': data['username'],
                        'text': data['text'],
                    }
        )

    async def receive(self, text_data):#路由
        data = json.loads(text_data)
        event = data['event']

        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
