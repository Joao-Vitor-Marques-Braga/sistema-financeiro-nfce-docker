# apps/extrator_fiscal/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Extração de dados da nota fiscal
    path('extract/', views.extract_invoice, name='extract-invoice'),
    
    # Consultas de verificação
    path('fornecedores/check/', views.check_fornecedor, name='check-fornecedor'),
    path('faturados/check/', views.check_faturado, name='check-faturado'),
    path('despesas/check/', views.check_despesa, name='check-despesa'),
    
    # Criação de registros
    path('fornecedores/', views.create_fornecedor, name='create-fornecedor'),
    path('faturados/', views.create_faturado, name='create-faturado'),
    path('despesas/', views.create_despesa, name='create-despesa'),
    path('movimentos/', views.create_movimento, name='create-movimento'),

    # CRUD Pessoas
    path('pessoas/', views.pessoas_list_create, name='pessoas-list-create'),
    path('pessoas/<int:pk>/', views.pessoas_retrieve_update, name='pessoas-retrieve-update'),
    path('pessoas/<int:pk>/toggle-status/', views.pessoas_toggle_status, name='pessoas-toggle-status'),

    # CRUD Classificacao
    path('classificacoes/', views.classificacao_list_create, name='classificacao-list-create'),
    path('classificacoes/<int:pk>/', views.classificacao_retrieve_update, name='classificacao-retrieve-update'),
    path('classificacoes/<int:pk>/toggle-status/', views.classificacao_toggle_status, name='classificacao-toggle-status'),
]