from django.urls import path, re_path
from django.views.static import serve

from config import settings
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('nidLogin/', views.nid_login, name='nid_login'),
    path('nidRegister/', views.register, name='nid_register'),
    path('login/', views.login_response, name='login'),
    path('register/', views.register_response, name='register'),
]