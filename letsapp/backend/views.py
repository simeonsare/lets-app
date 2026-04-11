import base64
import json
from datetime import datetime
import random
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import requests
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
from .models import TraderProfile,RiderProfile, Request,LSPs,Payments
from django.contrib.auth.tokens import default_token_generator

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
        last_name=data.get("second_name", ""),
        username=data["email"],  # Django uses "username" for loginng in so we store the email as username , we’ll store email here
        email=data["email"],
        password=make_password(data["password"])
    )
    if data["role"] == "trader":
        profile = TraderProfile.objects.create(
            user=user,
            phone=data.get("phone", ""),
            stall_building=data.get("stall_building", ""),
            stall_number=data.get("stall_number", "")
        )
    elif data["role"] == "rider":
        profile = RiderProfile.objects.create(
            user=user,
            phone=data.get("phone", ""),
            licenseplate_number=data.get("license_number", "")
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
        elif user.is_superuser:
            role = 'admin'
        return Response({"token": token.key, "role": role}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def trader_profile(request):
    user = request.user
    if TraderProfile.objects.filter(user_id=user.id).exists():
        profile = TraderProfile.objects.get(user_id=user.id)
        return Response({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": profile.phone,
            "stall_building": profile.stall_building,
            "stall_number": profile.stall_number,
            "floor": profile.floor
        }, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not a trader"}, status=status.HTTP_403_FORBIDDEN)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data
    if TraderProfile.objects.filter(user_id=user.id).exists():
        profile = TraderProfile.objects.get(user_id=user.id)
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("second_name", user.last_name)
        user.email = data.get("email", user.email)
        profile.phone = data.get("phone", profile.phone)
        profile.stall_building = data.get("stall_building", profile.stall_building)
        profile.stall_number = data.get("stall_number", profile.stall_number)
        profile.floor = data.get("floor", profile.floor)
        user.save()
        profile.save()
        return Response({"detail": "Profile updated successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not a trader"}, status=status.HTTP_403_FORBIDDEN)
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)

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
            pickup_location=trader.stall_building + " stall number " + trader.stall_number,
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
    
@api_view(["GET"])
@permission_classes([AllowAny])
def lsp_list(request):
    lsps = LSPs.objects.all()
    lsp_data = [{"name": lsp.name, "contact_info": lsp.contact_info, "price_per_kg": str(lsp.price_per_kg)} for lsp in lsps]
    return Response({"lsps": lsp_data}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_payment(request):
    data= request.data
    phone_number = data.get("phone_number")
    amount = data.get("amount")
    description = data.get("description")
    #get access token 
    url= f"{settings.MPESA_CONFIG['BASE_URL']}/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(
        url,
        auth=(
            settings.MPESA_CONFIG['CONSUMER_KEY'],
            settings.MPESA_CONFIG['CONSUMER_SECRET']
        )
    )
    if response.status_code == 200:
        accesstoken = response.json().get('access_token')
    else:
        return Response({"detail": "Failed to get access token"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
     #   # push stk to customer 
    if not all([phone_number, amount, description]):
        return Response({"detail": "Phone number, amount, and description are required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        business_short_code = settings.MPESA_CONFIG['BUSINESS_SHORT_CODE']
        passkey = settings.MPESA_CONFIG['PASSKEY']
        phone_number = phone_number.replace('+', '').replace(' ', '')
        amount = int(float(amount))
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = business_short_code + passkey + timestamp
        password = base64.b64encode(data_to_encode.encode()).decode()
        transaction_type = 'CustomerPayBillOnline'
        party_a = phone_number
        party_b = business_short_code
        reference = f"LetsApp Delivery request_{random.randint(100000, 999999)}"  # Generate a random reference number

        data = {
            'BusinessShortCode': business_short_code,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': transaction_type,
            'Amount': amount,
            'PartyA': party_a,
            'PartyB': party_b,
            'PhoneNumber': phone_number,
            'CallBackURL': settings.MPESA_CONFIG['CALLBACK_URL'],
            'AccountReference': reference,
            'TransactionDesc': description,
        }
        headers = {
            "Authorization": f"Bearer {accesstoken}",
            "Content-Type": "application/json"
            }



        response = requests.post(
            f"{settings.MPESA_CONFIG['BASE_URL']}/mpesa/stkpush/v1/processrequest",
            json=data,
            headers=headers,
            timeout=10
        )
        response_data = response.json()
        if response.status_code == 200 and response_data.get("ResponseCode") == "0":
            response_data["success"] = True
        else:
            response_data["success"] = False
            response_data["errorMessage"] = response_data.get("errorMessage") or response_data.get("errorCode") or "Unknown error"
        return JsonResponse(response_data)


    except Exception as e:
        return Response({"detail": "An error occurred while processing payment", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   
#callback handling 
@csrf_exempt
def mpesa_callback(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        stk_callback = data.get("Body", {}).get("stkCallback", {})
        metadata_items = stk_callback.get("CallbackMetadata", {}).get("Item", [])

        # Convert Item list into a dict for easier access
        metadata = {item["Name"]: item.get("Value") for item in metadata_items}

        payment = Payments.objects.create(
            CheckoutRequestID=stk_callback.get("CheckoutRequestID", ""),
            MpesaReceiptNumber=metadata.get("MpesaReceiptNumber", ""),
            amount=metadata.get("Amount", 0),
            phone_number=metadata.get("PhoneNumber", ""),
            status="success" if stk_callback.get("ResultCode") == 0 else "failed"
        )

        return JsonResponse({"detail": "Callback received successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"detail": "An error occurred while handling callback", "error": str(e)}, status=500)
#return payment status for a given checkout request id to frontend
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_status(request, checkoutid):
    try:
        payment = Payments.objects.get(CheckoutRequestID=checkoutid)
        return Response({"status": payment.status}, status=status.HTTP_200_OK)
    except Payments.DoesNotExist:
        return Response({"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)