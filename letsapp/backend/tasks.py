# backend/tasks.py
from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Request, RiderProfile
import time


@shared_task(bind=True)
def dispatch_request(self, request_id):
    try:
        request = Request.objects.get(id=request_id)
    except Request.DoesNotExist:
        return  # request was deleted, nothing to do

    channel_layer = get_channel_layer()

    # Get all available online riders who are not busy
    riders = RiderProfile.objects.filter(
        is_online=True,
        is_busy=False
    ).order_by('id')  # TODO: swap with proximity-based ordering 
    print(f"found {riders.count()} riders to dispatch request {request_id}")

    if not riders.exists():
        # No riders online at all — go straight to admin
        request.status = 'manual'
        request.save()

        async_to_sync(channel_layer.group_send)(
            'admin_room',
            {
                'type': 'manual_assignment',
                'request_id': request_id,
                'message': 'No riders online. Manual assignment needed.',
                'pickup': request.pickup_location,
                'dropoff': request.dropoff_location,
                'package': request.package_details,
                'quantity': request.quantity,
            }
        )
        return

    # Mark as dispatching
    request.status = 'dispatching'
    request.save()

    for rider in riders:
        # Re-check before each broadcast — another rider may have accepted
        request.refresh_from_db()
        if request.status == 'assigned':
            return

        # Re-check rider is still available (status may have changed)
        rider.refresh_from_db()
        if not rider.is_online or rider.is_busy:
            continue  # skip this rider, try next

        # Broadcast to this specific rider via WebSocket
        async_to_sync(channel_layer.group_send)(
            f'rider_{rider.id}',
            {
                'type': 'delivery_request',
                'request_id': request_id,
                'pickup': request.pickup_location,
                'dropoff': request.dropoff_location,
                'package': request.package_details,
                'quantity': request.quantity,
                'expires_in': 30,
            }
        )

        # Wait 30 seconds for rider to accept
        time.sleep(30)

        # Check if accepted during that window
        request.refresh_from_db()
        if request.status == 'assigned':
            return  # done, a rider accepted

    # All riders rejected or did not accept the request, nobody accepted — escalate to admin
    request.refresh_from_db()
    if request.status != 'assigned':
        request.status = 'manual'
        request.save()

        async_to_sync(channel_layer.group_send)(
            'admin_room',
            {
                'type': 'manual_assignment',
                'request_id': request_id,
                'message': 'No rider accepted. Manual assignment needed.',
                'pickup': request.pickup_location,
                'dropoff': request.dropoff_location,
                'package': request.package_details,
                'quantity': request.quantity,
            }
        )