# Generated by Django 5.1.4 on 2024-12-18 08:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        ('app', '0003_accesshistory'),
    ]

    operations = [
        migrations.CreateModel(
            name='AccessHistory',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('app.accesshistory',),
        ),
    ]
