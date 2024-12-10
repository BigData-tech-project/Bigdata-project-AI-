from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('nidLogin/', views.nid_login, name='nid_login'),
    path('nidRegister/', views.register, name='nid_register'),
    path('login/', views.login_response, name='login'),
    path('register/', views.register_response, name='register'),
]