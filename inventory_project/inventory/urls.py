from django.urls import path
from . import views

urlpatterns = [
    path('', views.index), 
    path('products/', views.get_products),
    path('add/', views.add_product),
    path('delete/<int:id>/', views.delete_product),
    path('update/<int:id>/', views.update_product),
]