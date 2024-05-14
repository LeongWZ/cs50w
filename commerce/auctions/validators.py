from django.core.exceptions import ValidationError

from .models import Category

def validate_category(category_name):
    if not Category.objects.filter(name=category_name).exists():
        raise ValidationError(
            message=f"Category {category_name} does not exist",
            params={"category_name": category_name}
        )