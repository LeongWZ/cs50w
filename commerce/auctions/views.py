from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Max


from .models import User, Category, Listing, Bid, Comment
from .forms import CreateListingForm, CreateCommentForm, SubmitBidForm


def listing_exists(listing_id):
    return Listing.objects.filter(pk=listing_id).exists()

def category_exists(category_id):
    return Category.objects.filter(pk=category_id).exists()

def find_max_bid(listing):
    max_bid_amount = listing.bids.aggregate(Max('amount'))['amount__max']
    return Bid.objects.filter(listing=listing, amount=max_bid_amount).first()


def index(request):
    active_listings = Listing.objects.filter(is_closed=False)
    listing_max_bid_pairs = map(
        lambda listing: (listing, find_max_bid(listing)),
        active_listings
        )
    return render(request, "auctions/index.html", {
        "title": "Active Listings",
        "listing_max_bid_pairs": listing_max_bid_pairs,
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required
def create_listing(request):
    if request.method == "POST":
        form = CreateListingForm(request.POST)
        if not form.is_valid():
            return render(request, "auctions/create_listing.html", {
                "message": form.errors,
                "categories": Category.objects.all(),
            })
        
        user_id = request.user.id
        title = form.cleaned_data["title"]
        description = form.cleaned_data["description"]
        starting_bid = form.cleaned_data["starting_bid"]
        image_url = form.cleaned_data["image_url"]

        category_name = form.cleaned_data["category_name"]
        category = Category.objects.filter(name=category_name).first()
        category_id = category.id if category else None

        listing = Listing(user_id=user_id,
                          title=title,
                          description=description,
                          starting_bid=starting_bid,
                          image_url=image_url,
                          category_id=category_id)
        listing.save()
        return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))

    return render(request, "auctions/create_listing.html", {
        "categories": Category.objects.all()
    })

def error(request, message):
    return render(request, "auctions/error.html", {
        "message": message
    })

def listing(request, listing_id):
    if not listing_exists(listing_id):
        return error(request, "Listing does not exist")
    
    listing = Listing.objects.get(pk=listing_id)
    max_bid = find_max_bid(listing)
    is_on_watchlist = request.user.is_authenticated and listing.watched_by.filter(pk=request.user.id).exists()
    message = ""

    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect("login")
        
        form = SubmitBidForm(request.POST)

        if form.is_valid():
            bid_amount = form.cleaned_data["bid"]

            if max_bid and bid_amount <= max_bid.amount:
                message = "Bid amount must be greater than bidding price."
            elif not max_bid and bid_amount < listing.starting_bid:
                message = "Bid amount must be at least the starting bid."
            else:
                bid = Bid(user_id=request.user.id, listing_id=listing_id, amount=bid_amount)
                bid.save()
                return render(request, "auctions/listing.html", {
                    "listing": listing,
                    "is_on_watchlist": is_on_watchlist,
                    "max_bid": bid,
                    "bid_count": listing.bids.count(),
                    "comments": listing.comments.all(),
                })
            
    return render(request, "auctions/listing.html", {
        "listing": listing,
        "is_on_watchlist": is_on_watchlist,
        "max_bid": max_bid,
        "bid_count": listing.bids.count(),
        "comments": listing.comments.all(),
        "message": message,
    })

@login_required
def close_listing(request, listing_id):
    if not listing_exists(listing_id):
        return error(request, "Listing does not exist")
    
    listing = Listing.objects.get(pk=listing_id)
    
    if request.method == "POST" and listing.user == request.user:
        listing.is_closed = True
        listing.save()
        return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))

@login_required
def listing_comment(request, listing_id):
    if not listing_exists(listing_id):
        return error(request, "Listing does not exist")
    
    listing = Listing.objects.get(pk=listing_id)
    
    if request.method == "POST":
        form = CreateCommentForm(request.POST)

        if form.is_valid():
            comment = Comment(user_id=request.user.id, listing_id=listing.id, content=form.cleaned_data["comment"])
            comment.save()
        
        return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))
    
@login_required
def watchlist(request):
    watchlist = request.user.watchlist.all()

    listing_max_bid_pairs = map(
        lambda listing: (listing, find_max_bid(listing)),
        watchlist
        )
    
    return render(request, "auctions/index.html", {
        "title": "Watchlist",
        "listing_max_bid_pairs": listing_max_bid_pairs,
    })

@login_required
def add_to_watchlist(request, listing_id):
    if not listing_exists(listing_id):
        return error(request, "Listing does not exist")
    
    if request.method == "POST":
        listing = Listing.objects.get(pk=listing_id)
        listing.watched_by.add(User.objects.get(pk=request.user.id))
        return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))
    
def categories(request):
    return render(request, "auctions/categories.html", {
        "categories": Category.objects.all(),
    })

def view_by_category(request, category_id):
    if not category_exists(category_id):
        return error(request, "Category does not exist")
    
    category = Category.objects.get(pk=category_id)
    listings = category.listings.all()

    listing_max_bid_pairs = map(
        lambda listing: (listing, find_max_bid(listing)),
        listings
        )
    
    return render(request, "auctions/index.html", {
        "title": "Active Listings: " + category.name,
        "listing_max_bid_pairs": listing_max_bid_pairs,
    })