# backend/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Request, RiderProfile


class RiderConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.rider_id = self.scope['url_route']['kwargs']['rider_id']
        self.group_name = f'rider_{self.rider_id}'

        # Add rider to their personal channel group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Mark rider as online when they connect
        await sync_to_async(
            RiderProfile.objects.filter(id=self.rider_id).update
        )(is_online=True)

        await self.accept()

    async def disconnect(self, close_code):
        # Mark rider as offline when they disconnect
        await sync_to_async(
            RiderProfile.objects.filter(id=self.rider_id).update
        )(is_online=False)

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        request_id = data.get('request_id')

        if action == 'accept':
            await self.handle_accept(request_id)

        elif action == 'reject':
            # Just acknowledge — the task will move to next rider after 30s
            await self.send(text_data=json.dumps({
                'type': 'rejected',
                'message': 'You rejected this request.',
                'request_id': request_id,
            }))

    async def handle_accept(self, request_id):
        try:
            request = await sync_to_async(Request.objects.get)(id=request_id)
            rider = await sync_to_async(RiderProfile.objects.get)(id=self.rider_id)
        except (Request.DoesNotExist, RiderProfile.DoesNotExist):
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Request or rider not found.',
            }))
            return

        # Race condition check — only assign if still pending/dispatching
        if request.status in ('pending', 'dispatching'):
            request.status = 'assigned'
            request.rider = rider
            await sync_to_async(request.save)()

            # Mark rider as busy
            rider.is_busy = True
            await sync_to_async(rider.save)()

            await self.send(text_data=json.dumps({
                'type': 'accepted',
                'message': 'Delivery assigned to you!',
                'request_id': request_id,
                'pickup': request.pickup_location,
                'dropoff': request.dropoff_location,
            }))

        else:
            # Another rider already accepted it
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'This request was already taken.',
                'request_id': request_id,
            }))

    # Called by Celery task when broadcasting a delivery request
    async def delivery_request(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delivery_request',
            'request_id': event['request_id'],
            'pickup': event['pickup'],
            'dropoff': event['dropoff'],
            'package': event['package'],
            'quantity': event['quantity'],
            'expires_in': event['expires_in'],
        }))


class AdminConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # All admin connections join the same admin room
        await self.channel_layer.group_add(
            'admin_room',
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            'admin_room',
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        # Admin manually assigns a rider
        if action == 'manual_assign':
            request_id = data.get('request_id')
            rider_id = data.get('rider_id')
            await self.handle_manual_assign(request_id, rider_id)

    async def handle_manual_assign(self, request_id, rider_id):
        try:
            request = await sync_to_async(Request.objects.get)(id=request_id)
            rider = await sync_to_async(RiderProfile.objects.get)(id=rider_id)
        except (Request.DoesNotExist, RiderProfile.DoesNotExist):
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Request or rider not found.',
            }))
            return

        request.status = 'assigned'
        request.rider = rider
        await sync_to_async(request.save)()

        rider.is_busy = True
        await sync_to_async(rider.save)()

        await self.send(text_data=json.dumps({
            'type': 'manual_assigned',
            'message': f'Request {request_id} manually assigned to rider {rider_id}',
            'request_id': request_id,
            'rider_id': rider_id,
        }))

    # Called by Celery task when escalating to admin
    async def manual_assignment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'manual_assignment',
            'request_id': event['request_id'],
            'message': event['message'],
            'pickup': event['pickup'],
            'dropoff': event['dropoff'],
            'package': event['package'],
            'quantity': event['quantity'],
        }))