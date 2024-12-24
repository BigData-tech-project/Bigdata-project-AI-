from django.db import models

class Product(models.Model):
    region = models.CharField(max_length=100, default='-')  # 기본값 추가
    region_detail = models.CharField(max_length=255, default='-')  # 추가된 필드
    disease = models.CharField(max_length=100, default='-')  # 기본값 추가
    

    def __str__(self):
        return f"{self.region} - {self.region_detail} - {self.disease}"
