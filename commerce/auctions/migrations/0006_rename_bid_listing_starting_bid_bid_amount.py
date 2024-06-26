# Generated by Django 5.0.4 on 2024-05-13 14:52

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0005_bid_listing'),
    ]

    operations = [
        migrations.RenameField(
            model_name='listing',
            old_name='bid',
            new_name='starting_bid',
        ),
        migrations.AddField(
            model_name='bid',
            name='amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=19, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]
