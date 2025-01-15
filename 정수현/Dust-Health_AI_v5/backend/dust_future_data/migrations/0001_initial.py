# Generated by Django 4.2.17 on 2025-01-15 01:28

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FutureDustForecast',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city', models.CharField(max_length=100)),
                ('region', models.CharField(max_length=100)),
                ('data_time', models.CharField(max_length=50)),
                ('inform_grade', models.TextField()),
                ('inform_cause', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
