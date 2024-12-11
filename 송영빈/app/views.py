# Create your views here.
from django import template
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from datetime import datetime
from .models import Users, Info
import logging

logger = logging.getLogger('custom_logger')

def get_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def main(request):
    context = {
        'now': datetime.now()
    }
    return render(request, 'main.html', context)

def nid_login(request):
    context = {}
    return render(request, 'nidLogin.html', context)

def register(request):
    context = {}
    return render(request, 'nidRegister.html', context)

def login_response(request):
    if request.method == 'POST':
        user_id = request.POST.get('id')
        user_pw = request.POST.get('pw')

        # 사용자가 입력한 ID에 해당하는 사용자 정보를 DB에서 조회
        try:
            user = Users.objects.get(user_id=user_id)  # Users 모델에서 ID로 검색
        except Users.DoesNotExist:
            # 해당 ID를 가진 사용자가 없다면 로그인 실패 처리
            return JsonResponse({'success': False, 'message': '아이디가 존재하지 않습니다.'})

        # DB에 저장된 비밀번호와 입력된 비밀번호를 비교
        if user_pw == user.password:  # 비밀번호 비교
            login(request, user)
            return JsonResponse({'success': True, 'data': user.nickname})  # 로그인 성공
        else:
            return JsonResponse({'success': False, 'message': '비밀번호가 틀렸습니다.'})  # 비밀번호 오류

    return JsonResponse({'success': False, 'message': '올바른 접근이 아닙니다.'}, status=400)  # POST가 아닐 경우 에러 응답

def log_out(request):
    logout(request)
    return redirect('/')

def register_response(request):
    if request.method == 'POST':
        user_id = request.POST.get('id')
        user_pw = request.POST.get('pw')
        user_email = request.POST.get('email')
        user_nickname = request.POST.get('nickname')

        # 유효성 검사
        if not user_id or not user_pw:
            return JsonResponse({'success': False, 'message': '모든 필드를 입력해야 합니다.'})

        # ID 중복 확인
        if Users.objects.filter(user_id=user_id).exists():
            return JsonResponse({'success': False, 'message': '이미 사용 중인 아이디입니다.'})

        # Email 중복 확인(None이면 패스)
        if user_email and Users.objects.filter(email=user_email).exists():
            return JsonResponse({'success': False, 'message': '이미 사용 중인 이메일입니다.'})

        # 닉네임이 없으면 id로 교체
        if not user_nickname:
            user_nickname = user_id

        # 새로운 사용자 생성 및 저장
        try:
            with transaction.atomic():
                # 새로운 사용자 생성
                new_user = Users(
                    user_id=user_id,
                    password=user_pw,  # 해싱된 비밀번호 저장
                    email=user_email,
                    nickname=user_nickname,
                )
                new_user.save()

                # Info 생성
                new_info = Info(
                    id=new_user,  # ForeignKey에 Users 인스턴스 할당
                    region=None,
                    diseases=None,
                )
                new_info.save()

            return JsonResponse({'success': True, 'message': '회원가입이 완료되었습니다.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': '회원가입 중 오류가 발생했습니다.', 'error': str(e)})

    return JsonResponse({'success': False, 'message': '잘못된 요청입니다.'}, status=400)
