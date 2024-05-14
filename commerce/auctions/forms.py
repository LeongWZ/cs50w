from django.core.validators import MinValueValidator
from django import forms

from .validators import validate_category


class CreateListingForm(forms.Form):
    title = forms.CharField(max_length=64)
    description = forms.CharField(max_length=1000)
    starting_bid = forms.DecimalField(max_digits=19, decimal_places=2, validators=[MinValueValidator(0)])
    image_url = forms.URLField(required=False)
    category_name = forms.CharField(required=False, max_length=64, validators=[validate_category])


class SubmitBidForm(forms.Form):
    bid = forms.DecimalField(max_digits=19, decimal_places=2, validators=[MinValueValidator(0)])


class CreateCommentForm(forms.Form):
    comment = forms.CharField(max_length=1000)