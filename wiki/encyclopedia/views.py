from random import randrange
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from markdown2 import Markdown

from . import util

class SearchForm(forms.Form):
    q = forms.CharField()

class CreateForm(forms.Form):
    title = forms.CharField(required=True)
    content = forms.CharField(required=True)

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries(),
    })

def entry(request, title):
    entry = util.get_entry(title)
    if entry is None:
        return error(request, f'"{title}" page not found')
    
    return render(request, "encyclopedia/entry.html", {
        "title": title,
        "entry": Markdown().convert(entry),
    })

def error(request, message):
    return render(request, "encyclopedia/error.html", {
        "message": message
    })

def search(request, query=""):
    if request.method == "POST":
        form = SearchForm(request.POST)
        if form.is_valid():
            q = form.cleaned_data["q"]

            if util.get_entry(q):
                return HttpResponseRedirect(reverse("entry", kwargs={"title": q}))
            
            return render(request, "encyclopedia/search.html", {
                "query": q,
                "entries": filter(
                    lambda entry: q.lower() in entry.lower(),
                    util.list_entries()
                ),
            })

    return render(request, "encyclopedia/search.html", {
        "query": query,
        "entries": filter(
            lambda entry: query.lower() in entry.lower(),
            util.list_entries()
        ),
    })

def create(request):
    if request.method == "POST":
        form = CreateForm(request.POST)

        if not form.is_valid():
            return render(request, "encyclopedia/create.html", {
                "title": form.data["title"],
                "content": form.data["content"],
                "error_message": str(form.errors)
            })
        
        title = form.cleaned_data["title"]
        content = form.cleaned_data["content"]

        if util.get_entry(title):
            return render(request, "encyclopedia/create.html", {
                "title": title,
                "content": content,
                "error_message": f"An encyclopedia entry already exists with the provided title - {title}"
            })
        
        util.save_entry(title, content)
        return HttpResponseRedirect(reverse("entry", kwargs={"title": title}))
        
    return render(request, "encyclopedia/create.html")

def edit(request, title):
    if not util.get_entry(title):
        return error(request, message="Page not found")
    
    if request.method == "POST":
        form = CreateForm(request.POST)

        if not form.is_valid():
            return render(request, "encyclopedia/edit.html", {
                "title": title,
                "content": form.data["content"],
                "error_message": str(form.errors)
            })

        content = form.cleaned_data["content"]
    
        util.save_entry(title, content)
        return HttpResponseRedirect(reverse("entry", kwargs={"title": title}))

    
    return render(request, "encyclopedia/edit.html", {
        "title": title,
        "content": util.get_entry(title)
    })

def random(request):
    entries = util.list_entries()

    if len(entries) == 0:
        return HttpResponseRedirect(reverse("index"))
    
    random_title = entries[randrange(0, len(entries))]
    return HttpResponseRedirect(reverse("entry", kwargs={"title": random_title}))