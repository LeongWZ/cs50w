import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post

POSTS_PER_PAGE = 10


def index(request):
    return render(request, "network/index.html")

@login_required
def following_view(request):
    return render(request, "network/following.html")

def profile_view(request, username):
    return render(request, "network/profile.html")

@login_required
def read_posts(request, page_num: str):
    user: User = request.user
    posts: list[Post] = Post.objects.filter(user__in=user.following.all()).order_by("-created_at")
    page_number = int(page_num)
    paginator = Paginator(posts, POSTS_PER_PAGE)
    
    return JsonResponse(
        {
            "posts": [post.serialize() for post in paginator.get_page(page_number).object_list],
            "page": page_number,
            "num_pages": paginator.num_pages
        },
        safe=False
    )

def read_all_posts(request, page_num: str):
    posts: list[Post] = Post.objects.all().order_by("-created_at")
    page_number = int(page_num)
    paginator = Paginator(posts, POSTS_PER_PAGE)
    
    return JsonResponse(
        {
            "posts": [post.serialize() for post in paginator.get_page(page_number).object_list],
            "page": page_number,
            "num_pages": paginator.num_pages
        },
        safe=False
    )

@csrf_exempt
@login_required
def edit_or_delete_post(request, id: int):
    
    if request.method != "POST" and request.method != "DELETE":
        return JsonResponse({"error": "POST or DELETE request required."}, status=400)
    
    post = request.user.posts.get(id=id)

    if not post:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.method == "DELETE":
        post.delete()
        return JsonResponse({"message": "Post deleted successfully."}, status=200)
    
    data = json.loads(request.body)
    content: str = data.get("content")
    if not content:
        return JsonResponse({"error": "Post content cannot be empty."}, status=400)
    
    post.content = content
    post.save()
    return JsonResponse({
        "message": "Post updated successfully.",
        "post": post.serialize()
        }, status=200)

@csrf_exempt
@login_required
def create_post(request):
    
    # creation of new post must be done via POST request
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    title: str = data.get("title")
    content: str = data.get("content")
    if not title or not content:
        return JsonResponse({"error": "Post title and content cannot be empty."}, status=400)
    
    post = Post(user=request.user, title=title, content=content)
    post.save()
    return JsonResponse({"message": "Post created successfully."}, status=201)

def read_profile(request, username, page_num):
    user = User.objects.get(username=username)
    page_number = int(page_num)

    if not user:
        return JsonResponse({"error": "User not found."}, status=404)
    
    posts: list[Post] = user.posts.all().order_by("-created_at")
    paginator = Paginator(posts, POSTS_PER_PAGE)
    
    profile = {
        "user": user.serialize(),
        "posts": [post.serialize() for post in paginator.get_page(page_number).object_list],
        "page": page_number,
        "num_pages": paginator.num_pages
    }

    return JsonResponse(profile, safe=False)

def read_personal_info(request):
    user: User = request.user

    if not User.objects.filter(username=user.username).exists():
        return JsonResponse({"error": "User not found."}, status=404)
    
    return JsonResponse({"user": user.serialize()}, safe=False)

@csrf_exempt
@login_required
def follow(request, username):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    user = User.objects.get(username=username)
    if not user:
        return JsonResponse({"error": "User not found."}, status=404)
    
    if user == request.user:
        return JsonResponse({"error": "You cannot follow yourself."})
    
    request.user.following.add(user)
    return JsonResponse({"message": "User followed successfully."}, status=200)

@csrf_exempt
@login_required
def unfollow(request, username):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    user = User.objects.get(username=username)

    if not user:
        return JsonResponse({"error": "User not found."}, status=404)
    
    request.user.following.remove(user)
    return JsonResponse({"message": "User unfollowed successfully."}, status=200)

@csrf_exempt
@login_required
def like_post(request, id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    post = Post.objects.get(id=id)

    if not post:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    post.likes.add(request.user)
    return JsonResponse({
        "message": "Post liked successfully.",
        "post": post.serialize()
        }, status=200)

@csrf_exempt
@login_required
def unlike_post(request, id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    post = Post.objects.get(id=id)

    if not post:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    post.likes.remove(request.user)
    return JsonResponse({
        "message": "Post unliked successfully.",
        "post": post.serialize()
        }, status=200)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
