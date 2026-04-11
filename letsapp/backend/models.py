from xml.parsers.expat import model
from django.db import models
from django.contrib.auth.models import User



class TraderProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phone=models.CharField(max_length=20, blank=True)
    stall_building=models.CharField(max_length=100, blank=True)
    floor = models.IntegerField(blank=True)
    stall_number=models.CharField(max_length=10, blank=True)
    role='trader'
    def __str__(self):
        return self.username
        
class RiderProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phone=models.CharField(max_length=20, blank=True)
    licenseplate_number=models.CharField(max_length=20, blank=True)
    role='rider'
    def __str__(self):
        return self.username
    
    
class Deliveries(models.Model):
    trader = models.ForeignKey(TraderProfile, on_delete=models.CASCADE)
    rider = models.ForeignKey(RiderProfile, on_delete=models.CASCADE)
    request_time = models.DateTimeField()
    delivery_time = models.DateTimeField()
    status = models.CharField(max_length=20, default='pending')
    destination = models.CharField(max_length=255, blank=True)
    packageDesc=models.CharField(max_length=255, blank=True)
    quantity=models.IntegerField(default=1)
    def __str__(self):
        return f"Delivery from {self.trader.user.email} to {self.destination} - Status: {self.status}"

class Request(models.Model):
    trader = models.ForeignKey(TraderProfile, on_delete=models.CASCADE)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    package_details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=20, default='pending')
    def __str__(self):
        return f"Request from {self.trader.user.email} - Status: {self.status}"
# model for the lsps we are to work with 
class LSPs(models.Model):
    name = models.CharField(max_length=100)
    contact_info = models.CharField(max_length=255)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    logo = models.ImageField(upload_to='lsp_logos/', blank=True, null=True)
    def __str__(self):
        return self.name
#model for payments 
class Payments(models.Model):
    CheckoutRequestID = models.CharField(max_length=255, unique=True)
    MpesaReceiptNumber= models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default='pending')
    def __str__(self):
        return f"Payment {self.CheckoutRequestID} - Status: {self.status}"

# Create your models here.
