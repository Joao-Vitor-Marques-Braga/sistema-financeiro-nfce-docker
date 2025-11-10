from django.urls import path
from . import views

urlpatterns = [
    path('query/', views.rag_query, name='rag-query'),
]

