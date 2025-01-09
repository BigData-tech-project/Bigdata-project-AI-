import requests
import datetime

API_URL = "http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst"
SERVICE_KEY = "pVHLUl3UGVDmm+B0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU/dELSR6nZ318fR3efuSBb3gVpjAFFA=="

def fetch_air_quality(city):
    """
    지정된 도시의 미세먼지 데이터를 API에서 가져옵니다.
    """
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
        if response.status_code == 200:
            data = response.json()
            return data.get("response", {}).get("body", {}).get("items", [])
        else:
            print(f"API Error: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching air quality: {e}")
        return []

def save_to_database(items, city, connection):
    """
    가져온 데이터를 데이터베이스에 저장합니다.
    """
    from sqlalchemy import text

    for item in items:
        region = item.get("cityName", "")
        pm10 = float(item.get("pm10Value", 0) or 0)
        pm2_5 = float(item.get("pm25Value", 0) or 0)
        date_time = datetime.datetime.now()

        query = text("""
            INSERT INTO AirQuality (date_time, city, region, pm10, pm2_5)
            VALUES (:date_time, :city, :region, :pm10, :pm2_5)
        """)
        connection.execute(
            query,
            {
                "date_time": date_time,
                "city": city,
                "region": region,
                "pm10": pm10,
                "pm2_5": pm2_5,
            },
        )
