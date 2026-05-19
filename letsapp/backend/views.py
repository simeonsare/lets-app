import base64
from itertools import count
import json
from datetime import datetime
import random
from django.utils import timezone
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
from .models import TraderProfile,RiderProfile, Request,LSPs,Payments,DeliveryEvents
from django.contrib.auth.tokens import default_token_generator
from .tasks import dispatch_request
from django.shortcuts import render
import os
from django.db.models import Count, Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def home(request):
    
    return render(request, "index.html")


    
#authentication and registration views
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    if User.objects.filter(username=data["email"]).exists():
        return Response({"detail": "User email selected already exists. please log in instead."}, status=status.HTTP_400_BAD_REQUEST)
    
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
    name = user.first_name +''+ user.last_name
    if user:
        token, created = Token.objects.get_or_create(user=user)
        role=''

        if TraderProfile.objects.filter(user=user).exists():
            role = 'trader'
        elif RiderProfile.objects.filter(user=user).exists():
            role = 'rider'
           
        elif user.is_superuser:
            role = 'admin'
        return Response({"token": token.key, "role": role, "name": name}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def userdata(request):
    user=request.user
    return user

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

#trader activities start
#trader dashboard
@api_view(["POST"])
@login_required
def create_request(request):
    user = request.user
    #create request
    if TraderProfile.objects.filter(user_id=user.id).exists():
        data = request.data
        trader = TraderProfile.objects.get(user_id=user.id)
        requestt = Request.objects.create(
            trader=trader,
            pickup_location=trader.stall_building + " stall number " + trader.stall_number,
            dropoff_location=data.get("dropoff_location", ""),
            package_details=data.get("package_details", ""),
            quantity=data.get("quantity", 1),
            status="pending"
        )
        requestt.save()
    #create delivery event
        event= DeliveryEvents.objects.create(
            request=requestt,
            status="Request created and paid for",
            timestamp=datetime.now(),
            description="Delivery request created for pickup at " + requestt.pickup_location + " and dropoff at " + requestt.dropoff_location
        )
        event.save()
        #fire the dispatch task to assign rider
        dispatch_request.delay(requestt.id)
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
        deliveries = Request.objects.filter(trader_id=trader_profile.id)
        serialized_deliveries = []
        for delivery in deliveries:
            serialized_deliveries.append({
                "id": delivery.id,
                "pickup_location": delivery.pickup_location,
                "dropoff_location": delivery.dropoff_location,
                "package_details": delivery.package_details,
                "created_at": delivery.created_at,
                "status": delivery.status,
                "quantity": delivery.quantity
            })

        user_id= user.id
        return Response({"deliveries": serialized_deliveries, "user_id": user_id}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not a trader"}, status=status.HTTP_403_FORBIDDEN)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def lsp_list(request):
    lsps = LSPs.objects.all()
    lsp_data = [{"name": lsp.name, "contact_info": lsp.contact_info, "price_per_kg": str(lsp.price_per_kg)} for lsp in lsps]
    return Response({"lsps": lsp_data}, status=status.HTTP_200_OK)
#mpesa payment processing view 
#start
@csrf_exempt
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
@api_view(["POST"])
@permission_classes([AllowAny])
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
#tracking info for a given delivery request id
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tracking_info(request,request_id):
    try:
        item= Request.objects.get(id=request_id)
        traderprofile = TraderProfile.objects.get(id=item.trader_id)
        trader = User.objects.get(id=traderprofile.user_id).first_name+" "+User.objects.get(id=traderprofile.user_id).last_name
        riderprofile = RiderProfile.objects.get(id=item.rider_id) if item.rider_id else None
        rider = User.objects.get(id=riderprofile.user_id).first_name+" "+User.objects.get(id=riderprofile.user_id).last_name if riderprofile else None
        event = DeliveryEvents.objects.filter(request_id=request_id).order_by('timestamp')
        timeline = []
        for e in event:
            timeline.append({
                "timestamp": e.timestamp,
                "description": e.description,
                "status": e.status,
                "completed": e.completed
            })
        return Response({
            "id": item.id,
            "trader": trader,
            "traderPhone": traderprofile.phone,
            "rider": rider,
            "pickup": item.pickup_location,
            "destination": item.dropoff_location,
            "packageDesc":item.package_details,
            "items": item.quantity,
            "currentStatus": item.status,
            "timeline": timeline           


        })
    except Request.DoesNotExist:
        return Response({"detail": "Delivery request not found"}, status=status.HTTP_404_NOT_FOUND)
#payment end 
#trader activities end


#rider activities start
#rider profile
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def rider_profile(request):
    user = request.user
    if RiderProfile.objects.filter(user_id=user.id).exists():
        profile = RiderProfile.objects.get(user_id=user.id)
        complete_deliveries = Request.objects.filter(rider_id=profile.id, status="completed")

        complete_deliveries = Request.objects.filter(
            rider_id=profile.id,
            status="completed"
        )

        serialized_deliveries = [
            {
                "id": delivery.id,
                "pickup_location": delivery.pickup_location,
                "destination": delivery.dropoff_location,
                "package_details": delivery.package_details,
                "quantity": delivery.quantity,
                "status": delivery.status,
                "created_at": delivery.created_at,
            }
            for delivery in complete_deliveries
        ]
        active_deliveries = Request.objects.filter(rider_id=profile.id).exclude(status="completed").count()
        assigned_deliveries = Request.objects.filter(rider_id=profile.id, status="assigned").count()
        return Response({
            "id": profile.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": profile.phone,
            "licenceplatenumber": profile.licenseplate_number,
            "vehicletype": profile.vehicletype,
            "complete_deliveries": serialized_deliveries,
            "active_deliveries": active_deliveries,
            "assigned_deliveries": assigned_deliveries,
        }, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not a rider"}, status=status.HTTP_403_FORBIDDEN)

#rider profile update
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_rider_profile(request):
    user = request.user
    data = request.data
    if RiderProfile.objects.filter(user_id=user.id).exists():
        profile = RiderProfile.objects.get(user_id=user.id)
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        profile.phone = data.get("phone", profile.phone)
        profile.licenseplate_number = data.get("licenceplatenumber", profile.licenseplate_number)
        profile.vehicletype = data.get("vehicletype", profile.vehicletype)
        user.save()
        profile.save()
        return Response({"detail": "Profile updated successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not a rider"}, status=status.HTTP_403_FORBIDDEN)
    
#rider availability and status change
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def status_change(request):
    user=request.user
    rider = RiderProfile.objects.get(user_id = user.id)
    is_online = request.data.get("is_online", False )
    rider.is_online = bool(is_online)  # ensures conversion
    rider.save()
    return Response({"detail": f"Rider status updated to {'online' if rider.is_online else 'offline'}"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assigned_orders(request):
    user = request.user
    rider = RiderProfile.objects.get(user_id=user.id)
    assigned_requests = Request.objects.filter(rider_id=rider.id, status="assigned")
    serialized_requests = []
    for req in assigned_requests:
        serialized_requests.append({
            "request_id": str(req.id),
            "type": req.type,
            "destination": req.dropoff_location.lower(),
            "trader_name": req.trader.user.get_full_name()
            if req.trader.user.get_full_name()
            else req.trader.user.email,
            "trader_phone": req.trader.phone if req.trader.phone else None,
            "quantity": req.quantity,
            "status": req.status,
            "pickup": req.pickup_location,
            "dropoff": req.dropoff_location,
            "package_details": req.package_details,
        })
    return Response({"assigned_requests": serialized_requests}, status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_request(request, request_id):
    user = request.user
    rider = RiderProfile.objects.get(user_id=user.id)
    try:
        delivery_request = Request.objects.get(id=request_id, rider_id=rider.id)
        delivery_request.status = "completed"
        delivery_request.save()
        
        #update rider status to not busy
        rider.is_busy = False
        rider.save()
        
        #create delivery event
        event= DeliveryEvents.objects.create(
            request=delivery_request,
            status="Delivery completed",
            timestamp=datetime.now(),
            description="Delivery request has been marked as completed by the rider."
        )
        event.save()
        return Response({"detail": "Delivery request marked as completed"}, status=status.HTTP_200_OK)
    except Request.DoesNotExist:
        return Response({"detail": "Delivery request not found or not assigned to this rider"}, status=status.HTTP_404_NOT_FOUND)

#rider activities end

#admin activities start 
@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_data(request):
    recent = (
    DeliveryEvents.objects
    .select_related(
        'request',
        'request__rider',
        'request__rider__user',
        'request__trader',
        'request__trader__user',
    )
    .order_by('-timestamp')[:5]
)


    data = {
        "totalRequests": Request.objects.count(),
        "totalDeliveries": Request.objects.filter(status="completed").count(),
        "activeDeliveries": Request.objects.filter(status__in=["pending", "assigned", "dispatching", "completed"]).count(),
        "totalRiders": RiderProfile.objects.count(),
        "activeRiders": RiderProfile.objects.filter(is_online=True).count(),
        "totalTraders": TraderProfile.objects.count(),
        "completedToday": Request.objects.filter(status="completed", created_at__date=timezone.now().date()).count(),
        "pendingAssignments": Request.objects.filter(status="manual").count(),
        # todo:
        # fix revenue to fetch completed payments from requests table and sum them up
         "revenue":  0,
         "recentActivities": [
    {
        "id": event.request.id,
        "trader": event.request.trader.user.email,
        "destination": event.request.dropoff_location.lower(),
        "status": event.request.status,
        "rider": (
            event.request.rider.user.get_full_name()
            if event.request.rider else None
        ),
        "time": event.timestamp,
    }
    for event in recent
],

        "topRiders": [
            {
                "name": rider.user.get_full_name(),
                "deliveries": rider.deliveries_count,  # use annotated value, avoid extra query per rider
            }
            for rider in RiderProfile.objects.select_related('user').annotate(
                deliveries_count=Count('request__id', filter=Q(request__status="completed"))
            ).order_by('-deliveries_count')[:5]
        ],
    }

    return Response(data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def rider_assignment_data(request):
    pending_requests = Request.objects.filter(status="manual",)
    serialized_requests = []
    for req in pending_requests:
        serialized_requests.append({
            "id": str(req.id),
            "type": req.type,
            "destination": req.dropoff_location.lower(),

            "trader": req.trader.user.get_full_name()
            if req.trader.user.get_full_name()
            else req.trader.user.email,

            "quantity": req.quantity,
            "status": req.status,
            "pickup_location": req.pickup_location,
            "dropoff_location": req.dropoff_location,
            "package_details": req.package_details,
        })
    total_riders= RiderProfile.objects.count()
    available_riders = RiderProfile.objects.select_related('user').filter(
        is_online=True,
        is_busy=False
    ).annotate(
        completed_deliveries=Count(
            'request',
            filter=Q(request__status='completed')
        )
    )
    data={
        "total_riders": total_riders,

        "availanble_riders":[
            {
                "id": rider.id,
                "name": rider.user.get_full_name(),
                "phone": rider.phone,
                "is_online": rider.is_online,
                "is_busy": rider.is_busy,
                "completed_deliveries": rider.completed_deliveries,
            }
            for rider in available_riders
            

        ],
        "pending_requests": serialized_requests,     
    


        }
   
      
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_rider(request):
    request_id = request.data.get("request_id")
    rider_id = request.data.get("rider_id")
    try:
        delivery_request = Request.objects.get(id=request_id, status="manual")
        rider = RiderProfile.objects.get(id=rider_id, is_online=True, is_busy=False)
        delivery_request.rider = rider
        delivery_request.status = "assigned"
        delivery_request.save()
        
        #update rider status to busy
        rider.is_busy = True
        rider.save()
        
        #create delivery event
        event= DeliveryEvents.objects.create(
            request=delivery_request,
            status="Rider assigned",
            timestamp=datetime.now(),
            description=f"Rider {rider.user.get_full_name()} has been manually assigned to this delivery request."
        )
        event.save()
        # ✅ Notify rider via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'rider_{rider.id}',
            {
                'type': 'assigned',
                'request_id': delivery_request.id,
                'pickup': delivery_request.pickup_location,
                'dropoff': delivery_request.dropoff_location,
                'package': delivery_request.package_details,
                'quantity': delivery_request.quantity,
                'expires_in': 30,
                'assigned': True,  # tells frontend to skip countdown
            }
        )
        
        return Response({"detail": f"Rider {rider.user.get_full_name()} assigned to request"}, status=status.HTTP_200_OK)
    except Request.DoesNotExist:
        return Response({"detail": "Delivery request not found or not pending manual assignment"}, status=status.HTTP_404_NOT_FOUND)
    except RiderProfile.DoesNotExist:
        return Response({"detail": "Rider not found or not available"}, status=status.HTTP_404_NOT_FOUND)
#admin activitites end 
