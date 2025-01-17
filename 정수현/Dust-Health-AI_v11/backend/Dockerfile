# Python 3.10 Slim 이미지 사용
FROM python:3.10-slim

# MySQL 및 PostgreSQL 클라이언트 및 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    libmariadb-dev-compat \
    default-libmysqlclient-dev \
    build-essential \
    libpq-dev \
    pkg-config \
    && apt-get clean

# pip 업그레이드 및 gunicorn 설치
RUN pip install --upgrade pip gunicorn openai requests

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# Django 실행
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
