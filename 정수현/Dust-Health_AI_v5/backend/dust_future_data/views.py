# dust_future_data/views.py
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .models import FutureDustForecast

service_key = "zhvs5TlKznNkfpG91l4BPgIcZtbsxovufWhyA4+w2KcaA1dp6RsGVOYHyD91i/XzDfAqOFIdScVjvbElsw+BCQ=="

@api_view(['GET'])
def fetch_and_save_future_data(request):
    city = request.GET.get('city')  # React에서 전달받은 city
    region = request.GET.get('region')  # React에서 전달받은 region
    service_key = "zhvs5TlKznNkfpG91l4BPgIcZtbsxovufWhyA4+w2KcaA1dp6RsGVOYHyD91i/XzDfAqOFIdScVjvbElsw+BCQ=="
    
    try:
        # API 호출
        response = requests.get(
            "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMinuDustFrcstDspth",
            params={
                "serviceKey": service_key,
                "returnType": "json",
                "searchDate": request.GET.get('searchDate', ''),  # 오늘 날짜
                "informCode": "PM10"
            },
        )
        data = response.json()

        # 특정 지역 필터링
        filtered_data = [
            {
                "data_time": item["dataTime"],
                "inform_grade": item["informGrade"],
                "inform_cause": item["informCause"],
            }
            for item in data.get("response", {}).get("body", {}).get("items", [])
            if city in item.get("informGrade", "") and region in item.get("informGrade", "")
        ]

        # 데이터베이스 저장
        for item in filtered_data:
            FutureDustForecast.objects.create(
                city=city,
                region=region,
                data_time=item["data_time"],
                inform_grade=item["inform_grade"],
                inform_cause=item["inform_cause"]
            )

        return Response({"filtered_data": filtered_data})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def get_future_forecast(request, city, region):
    forecasts = FutureDustForecast.objects.filter(city=city, region=region).order_by('-created_at')
    data = [
        {
            "data_time": forecast.data_time,
            "inform_grade": forecast.inform_grade,
            "inform_cause": forecast.inform_cause,
        }
        for forecast in forecasts
    ]
    return Response(data)