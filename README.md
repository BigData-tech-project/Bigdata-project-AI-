## 테스트 방법

루트 디렉터리에 `.env` 파일 생성 후 아래의 내용을 기재 후 저장

`REACT_APP_API_URL=http://127.0.0.1:8000`
`REACT_APP_API_KEY=pVHLUl3UGVDmm+B0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU/dELSR6nZ318fR3efuSBb3gVpjAFFA==`

이후 ```npm start``` 로 실행 ...
## 주의사항

실행 후 호스트 주소 변경 필요 

기본 실행 호스트가 [http://localhost:3000]()인데 

[http://127.0.0.1:3000]() 으로 바꿔서 접속해야 정상 실행 (CORS 오류)