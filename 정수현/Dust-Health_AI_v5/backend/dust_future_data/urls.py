# dust_future_data/urls.py
from django.urls import path
from .views import fetch_and_save_future_data, get_future_forecast

urlpatterns = [
    path("fetch-data/", fetch_and_save_future_data, name="fetch_future_data"),
    path("forecast/<str:city>/<str:region>/", get_future_forecast, name="get_future_forecast"),
]
