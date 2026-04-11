"""
URL configuration for letsapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from backend import views

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('api/register/',views.register_user, name='register'),
    path('api/login/', views.login_user, name='login'),
    path('api/forgot-password/', views.forgot_password, name='forgot_password'),
    path('api/trader/profile/', views.trader_profile, name='trader_profile'),
    path('api/update_profile/', views.update_profile, name='update_profile'),
    path('api/logout/', views.logout_user, name='logout'),
    
    path('api/request-delivery/', views.create_request, name='request_delivery'),
    path('api/process-payment/', views.process_payment, name='process_payment'),#path to mpesa payment processing
    path('api/deliveries/', views.deliveries, name='deliveries'), #path('create_profile/', views.create_profile, name='create_profile'),
    path ('api/lsps/', views.lsp_list, name='lsp_list'),
    path ('mpesa/callback/', views.mpesa_callback, name='mpesa_callback'),
    path ('api/payment-status/<str:checkoutid>/', views.payment_status, name='payment_status'),
]
