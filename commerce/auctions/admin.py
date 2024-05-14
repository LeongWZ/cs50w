from django.contrib import admin
from .models import User, Category, Listing, Bid, Comment

# Register your models here.
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", )

class BidAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "listing", "amount")

class ListingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "description", "starting_bid",
                    "image_url", "created_at", "is_closed", "category")
    
    filter_vertical = ("watched_by", )

class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "content", "created_at")

admin.site.register(User)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Bid, BidAdmin)
admin.site.register(Listing, ListingAdmin)
admin.site.register(Comment, CommentAdmin)