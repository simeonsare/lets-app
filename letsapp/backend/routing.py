# backend/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/rider/(?P<rider_id>\d+)/$', consumers.RiderConsumer.as_asgi()),
    re_path(r'ws/admin/$', consumers.AdminConsumer.as_asgi()),
]