# Generated by Django 5.1.4 on 2024-12-18 08:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_alter_info_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='AccessHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.CharField(db_column='USER_ID', max_length=16, verbose_name='app.Users')),
                ('access_time', models.DateTimeField(db_column='ACCESS_TIME', null=True)),
                ('access_ip', models.CharField(db_column='ACCESS_IP', max_length=40)),
                ('result', models.IntegerField(db_column='RESULT')),
            ],
            options={
                'db_table': 'access_history',
                'managed': True,
            },
        ),
    ]