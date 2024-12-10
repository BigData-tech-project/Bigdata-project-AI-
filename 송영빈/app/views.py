# Create your views here.
from django import template
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from datetime import datetime

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
    return render(request, 'register.html', context)

def login_response(request):
    if request.method == 'POST':
        user_id = request.POST.get('id')
        user_pw = request.POST.get('pw')

        # todo DB에서 진짜 있는 정보인지 확인

        res = True
        if res:
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False})
    return JsonResponse({'success': False}, status=400)