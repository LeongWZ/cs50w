from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name="followers")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "following": [user.username for user in self.following.all()],
            "followers": [user.username for user in self.followers.all()]
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    title = models.TextField()
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name="liked_posts")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "title": self.title,
            "content": self.content,
            "likes": list(map(lambda user: user.username, self.likes.all())),
            "created_at": self.created_at.strftime("%b %d %Y, %I:%M %p"),
            "updated_at": self.updated_at.strftime("%b %d %Y, %I:%M %p")
        }