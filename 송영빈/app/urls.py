from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('nidLogin/', views.nid_login, name='nid_login'),
    path('register/', views.register, name='register'),
    path('login/', views.login_response, name='login')
]