# dust_future_data/models.py
from django.db import models

class FutureDustForecast(models.Model):
    city = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    data_time = models.CharField(max_length=50)
    inform_grade = models.TextField()
    inform_cause = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.city} - {self.region} ({self.data_time})"
