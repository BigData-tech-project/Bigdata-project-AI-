import requests
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from rest_framework.decorators import api_view
from rest_framework.response import Response

# API URL과 키 설정
API_URL = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty"
API_KEY = "DF6HiAovAXVK90UBann8F9hMUobU7QiaW9YIUXn6QW7N1bkAgu5CT0nLDHV3VddrBh5xsuSoS7/D/HMNuNvwaw=="  # OpenAPI 인증키

# 지역 정보 (시와 구)
regions = {
    '서울': ['강남구', '강동구', '강북구'],
    # 테스트를 위해 지역을 일부로 축소했습니다.
}

@api_view(['GET'])
def predict_dust(request):
    all_predictions = {}

    for city, districts in regions.items():
        for district in districts:
            params = {
                "serviceKey": API_KEY,
                "returnType": "json",
                "numOfRows": "100",
                "pageNo": "1",
                "stationName": district,
                "dataTerm": "MONTH",
                "ver": "1.0"
            }

            try:
                # API 요청
                response = requests.get(API_URL, params=params)
                print(f"요청 URL: {response.url}")

                if response.status_code != 200:
                    raise Exception(f"HTTP {response.status_code}: {response.text}")

                try:
                    data = response.json()
                except Exception as e:
                    raise Exception(f"JSON 파싱 실패: {str(e)}, 응답: {response.text}")

                # 데이터 가공
                items = data.get("response", {}).get("body", {}).get("items", [])
                if not items:
                    raise Exception(f"{district} 지역에서 데이터를 찾을 수 없습니다.")

                # 데이터프레임 생성
                df = pd.DataFrame([{
                    "date": item.get("dataTime"),
                    "pm10": item.get("pm10Value")
                } for item in items])

                # 데이터 전처리
                df['date'] = df['date'].str.replace(" 24:00", " 00:00")
                df['date'] = pd.to_datetime(df['date'], format="%Y-%m-%d %H:%M", errors='coerce')
                df['pm10'] = pd.to_numeric(df['pm10'], errors='coerce')
                df.dropna(inplace=True)
                df['timestamp'] = df['date'].apply(lambda x: x.timestamp())

                if df.empty:
                    raise Exception(f"{district} 지역에 유효한 데이터가 없습니다.")

                # 모델 학습
                X = df[['timestamp']]
                y = df['pm10']
                model = LinearRegression()
                model.fit(X, y)

                # 미래 3일 예측
                future_dates = [(datetime.now() + timedelta(days=i)).timestamp() for i in range(1, 4)]
                predictions = model.predict(pd.DataFrame(future_dates))

                # 예측 결과 저장
                if city not in all_predictions:
                    all_predictions[city] = {}
                all_predictions[city][district] = {
                    "future_dates": [(datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, 4)],
                    "predictions": [round(p) for p in predictions]
                }

            except Exception as e:
                print(f"오류 ({city} - {district}): {str(e)}")
                if city not in all_predictions:
                    all_predictions[city] = {}
                all_predictions[city][district] = {"error": str(e)}

    return Response(all_predictions)
