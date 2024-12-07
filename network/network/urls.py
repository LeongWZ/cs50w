
from django.urls import path, re_path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.following_view, name="following"),
    path("users/<str:username>", views.profile_view, name="profile-view"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routes
    path("api/posts/<int:id>", views.edit_or_delete_post),
    path("api/posts/<int:id>/like", views.like_post),
    path("api/posts/<int:id>/unlike", views.unlike_post),
    re_path(r"api/posts/page-(?P<page_num>\d+)", views.read_posts),
    re_path(r"api/posts/all/page-(?P<page_num>\d+)", views.read_all_posts),
    path("api/posts/create", views.create_post),
    re_path(r"api/users/(?P<username>\w+)/page-(?P<page_num>\d+)", views.read_profile),
    path("api/users/<str:username>/follow", views.follow),
    path("api/users/<str:username>/unfollow", views.unfollow),
    path("api/user/", views.read_personal_info),
]
