from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
    {
      "role": "user",
      "content": [{ "type": "text", "text": "미세먼지 농도가 75 µg/m³일 때 폐렴 환자의 행동 요령." }]
    },
    {
      "role": "assistant",
      "content": [{ "type": "text", "text": "미세먼지 농도가 높아 폐렴 환자에게 증상 악화를 유발할 수 있습니다. 실내에 머무르며 예방 조치를 취하세요." }]
    },
    {
      "role": "user",
      "content": [{ "type": "text", "text": "미세먼지 농도가 25 µg/m³일 때 폐렴 환자의 행동 요령." }]
    }
    ]
)

# Create your views here.
def index(req):
    context={'response': completion.choices[0].message}
    return render(req,'index.html',context)

def behave(req):
    print(type(completion.choices[0].message.content))
    context={'response': completion.choices[0].message.content}
    return JsonResponse(data=context)