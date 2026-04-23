from django.shortcuts import render
from django.http import JsonResponse
from .models import Product
from django.views.decorators.csrf import ensure_csrf_cookie
import json

# UI PAGE
@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')

# GET PRODUCTS
def get_products(request):
    products = list(Product.objects.values())
    return JsonResponse(products, safe=False)

# ADD PRODUCT
def add_product(request):
    if request.method == "POST":
        data = json.loads(request.body)

        Product.objects.create(
            name=data['name'],
            quantity=data['quantity'],
            price=data['price'],
            category=data['category']
        )

        return JsonResponse({"message": "Added"})

# DELETE PRODUCT
def delete_product(request, id):
    Product.objects.filter(id=id).delete()
    return JsonResponse({"message": "Deleted"})

# UPDATE PRODUCT
def update_product(request, id):
    data = json.loads(request.body)

    p = Product.objects.get(id=id)
    p.name = data['name']
    p.quantity = data['quantity']
    p.price = data['price']
    p.category = data['category']
    p.save()

    return JsonResponse({"message": "Updated"})
