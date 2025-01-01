# Create your views here.
from django import template
from django.shortcuts import render
from django.http import HttpResponse
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