# Generated by Django 5.0.4 on 2024-05-13 16:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0007_rename_starting_bid_listing_price'),
    ]

    operations = [
        migrations.RenameField(
            model_name='listing',
            old_name='price',
            new_name='starting_bid',
        ),
    ]