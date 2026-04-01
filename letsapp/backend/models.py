from django.db import models
from django.contrib.auth.models import User



class TraderProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stall_building=models.CharField(max_length=100, blank=True)
    stall_number=models.CharField(max_length=10, blank=True)
    role='trader'
    def __str__(self):
        return self.username
        
class RiderProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    license_number=models.CharField(max_length=20, blank=True)
    role='rider'
    def __str__(self):
        return self.username





# Create your models here.
