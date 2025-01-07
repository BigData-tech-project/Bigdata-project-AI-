# **테스트 방법**

## 데이터 베이스 복원하기

`service` 데이터 베이스를 생성한 후

[db_init.bat](db_init.bat)을 편집모드로 열고 `Your_Password`를 수정 후 실행하거나 아래 구문을 커맨드라인에 복붙

`mysql -u root -pYour_Password service > table_backup.sql`

`PASSWORD` 는 DB의 루트 계정의 패스워드로 교체

## 서버 작동 시키기

루트 디렉토리에서 `python manage.py runserver`

## 덤프 파일 내 테스트 계정

`id`: test6666

`pw`: test6666