# Generated by Django 5.0.4 on 2024-05-14 07:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0010_alter_listing_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='content',
            field=models.CharField(default='', max_length=1000),
            preserve_default=False,
        ),
    ]