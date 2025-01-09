from django_cron import CronJobBase, Schedule
from .models import AirQuality
import requests
import datetime

API_URL = "http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst"
SERVICE_KEY = "pVHLUl3UGVDmm+B0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU/dELSR6nZ318fR3efuSBb3gVpjAFFA=="

class FetchAirQualityCronJob(CronJobBase):
    RUN_EVERY_MINS = 60  # 60분마다 실행

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'api.fetch_air_quality_cron_job'  # 고유 코드

    def do(self):
        # 여러 도시 데이터를 가져오기
        cities = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]
        for city in cities:
            try:
                response = requests.get(
                    API_URL,
                    params={
                        "serviceKey": SERVICE_KEY,
                        "returnType": "json",
                        "numOfRows": "100",
                        "pageNo": "1",
                        "sidoName": city,
                        "searchCondition": "DAILY",
                    },
                )
                print(f"[DEBUG] Request for city {city} - Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    items = response.json().get("response", {}).get("body", {}).get("items", [])
                    if not items:
                        print(f"[DEBUG] No data found for city: {city}")
                    else:
                        print(f"[DEBUG] Found {len(items)} records for city: {city}")
                        for item in items:
                            print(f"[DEBUG] Data: {item}")

                        # 데이터 저장
                        for item in items:
                            AirQuality.objects.create(
                                city=city,
                                region=item.get("cityName"),
                                pm10=item.get("pm10Value", 0) or 0,
                                pm2_5=item.get("pm25Value", 0) or 0,
                                date_time=datetime.datetime.now(),
                            )
                else:
                    print(f"[ERROR] Failed to fetch data for city: {city} - Status Code: {response.status_code}")
            except Exception as e:
                print(f"[ERROR] Exception occurred for city {city}: {e}")

