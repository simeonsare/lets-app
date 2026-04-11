from django.views.generic import TemplateView
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
from rest_framework import status
from rest_framework.reverse import reverse

from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token

from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Deliveries
from .models import TraderProfile,RiderProfile, Request
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail

#authentication and registration views
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    if User.objects.filter(username=data["email"]).exists():
        return Response({"detail": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create(
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        username=data["email"],  # Django uses "username" for loginng in so we store the email as username , we’ll store email here
        email=data["email"],
        password=make_password(data["password"])
    )
    if data["role"] == "trader":
        profile = TraderProfile.objects.create(
            user=user,
            stall_building=data.get("stall_building", ""),
            stall_number=data.get("stall_number", "")
        )
    elif data["role"] == "rider":
        profile = RiderProfile.objects.create(
            user=user,
        )
    return Response({"detail": "User created successfully with profile ", "profile_id": profile.id}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    user = authenticate(request, username=data["email"], password=data["password"])
    if user:
        token, created = Token.objects.get_or_create(user=user)
        role=''

        if TraderProfile.objects.filter(user=user).exists():
            role = 'trader'
        elif RiderProfile.objects.filter(user=user).exists():
            role = 'rider'
        return Response({"token": token.key, "role": role}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    data = request.data
    email = data.get("email")
    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:8000/reset-password/{user.pk}/{token}"
        #send_mail("Password Reset", f"Click here: {reset_link}", "noreply@letsapp.com", [email])
        return Response({"link": reset_link}, status=status.HTTP_200_OK )

    except User.DoesNotExist:
        return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)


#trader dashboard
@api_view(["POST"])
@login_required
def create_request(request):
    user = request.user
    if TraderProfile.objects.filter(user_id=user.id).exists():
        data = request.data
        trader = TraderProfile.objects.get(user_id=user.id)
        request = Request.objects.create(
            trader=trader,
            pickup_location=data.get("pickup_location", ""),
            dropoff_location=data.get("dropoff_location", ""),
            package_details=data.get("package_details", ""),
            status="pending"
        )
        return Response({"detail": "Delivery request created"}, status=status.HTTP_201_CREATED)
    else:
        return Response({"detail": "User is not a trader"}, status=status.HTTP_403_FORBIDDEN)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def deliveries(request):
    user = request.user
    if TraderProfile.objects.filter(user_id=user.id).exists():
        # Fetch deliveries for this trader
        trader_profile = TraderProfile.objects.get(user_id=user.id)
        deliveries = Deliveries.objects.filter(trader_id=trader_profile.id)
        user_id= user.id
        return Response({"deliveries": deliveries, "user_id": user_id}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not a trader"}, status=status.HTTP_403_FORBIDDEN)