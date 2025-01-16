import requests
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from rest_framework.decorators import api_view
from rest_framework.response import Response

# API URL과 키 설정
API_URL = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty"
API_KEY = "zhvs5TlKznNkfpG91l4BPgIcZtbsxovufWhyA4+w2KcaA1dp6RsGVOYHyD91i/XzDfAqOFIdScVjvbElsw+BCQ=="  # OpenAPI 인증키

# 지역 정보 (시와 구)
regions = {
    '서울': ['종로구', '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구',
           '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구',
           '영등포구', '용산구', '은평구', '중구', '중랑구'],
    '부산': ['해운대구', '수영구', '사상구', '부산진구', '동래구', '사하구', '연제구', '중구'],
    # 기타 시 추가 가능
}

@api_view(['GET'])
def predict_dust(request):
    # 모든 시와 지역의 예측 데이터를 저장할 딕셔너리
    all_predictions = {}

    for city, districts in regions.items():
        for district in districts:
            # API 요청 파라미터 설정
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
                data = response.json()

                # 데이터 가공
                items = data.get("response", {}).get("body", {}).get("items", [])
                records = []
                for item in items:
                    records.append({
                        "date": item.get("dataTime"),
                        "pm10": item.get("pm10Value"),
                    })

                # 데이터프레임 생성
                df = pd.DataFrame(records)

                # 데이터 전처리
                df['date'] = df['date'].str.replace(" 24:00", " 00:00")
                df['date'] = pd.to_datetime(df['date'], format="%Y-%m-%d %H:%M", errors='coerce')
                df['pm10'] = pd.to_numeric(df['pm10'], errors='coerce')
                df = df.dropna()
                df['timestamp'] = df['date'].apply(lambda x: x.timestamp())

                # 모델 학습
                X = df[['timestamp']]
                y = df['pm10']
                model = LinearRegression()
                model.fit(X, y)

                # 미래 3일 예측
                future_dates = [(datetime.now() + timedelta(days=i)).timestamp() for i in range(1, 4)]
                predictions = model.predict(pd.DataFrame(future_dates))

                # 시와 지역 이름을 키로 예측 결과 저장
                if city not in all_predictions:
                    all_predictions[city] = {}
                all_predictions[city][district] = {
                    "future_dates": [(datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, 4)],
                    "predictions": [round(p) for p in predictions]  # 소수점 제거
                }

            except Exception as e:
                if city not in all_predictions:
                    all_predictions[city] = {}
                all_predictions[city][district] = {"error": f"오류 발생: {str(e)}"}

    # 데이터 반환
    return Response(all_predictions)
