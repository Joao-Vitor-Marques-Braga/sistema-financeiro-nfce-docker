from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from datetime import datetime, timedelta
import uuid
from .services import ExtratorFiscalService
from .models import Pessoas, Classificacao, MovimentoContas, ParcelaContas
from .serializers import (
    PessoasSerializer, ClassificacaoSerializer, MovimentoContasSerializer,
    CheckFornecedorSerializer, CheckFaturadoSerializer, CheckDespesaSerializer,
    CreateMovimentoSerializer
)
import json
class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


# Pessoas CRUD e toggle
@api_view(['GET', 'POST'])
def pessoas_list_create(request):
    if request.method == 'GET':
        qs = Pessoas.objects.all()
        tipo = request.GET.get('tipo')
        status_param = request.GET.get('status')
        if tipo:
            qs = qs.filter(tipo=tipo)
        if status_param:
            qs = qs.filter(status=status_param)
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(qs.order_by('id'), request)
        serializer = PessoasSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    # POST
    payload = request.data.copy()
    # Normaliza documento
    if 'cnpj_cpf' in payload:
        payload['cnpj_cpf'] = ''.join(filter(str.isdigit, str(payload['cnpj_cpf'])))
    if payload.get('status') is None:
        payload['status'] = 'ATIVO'
    serializer = PessoasSerializer(data=payload)
    if serializer.is_valid():
        pessoa = serializer.save()
        return Response(PessoasSerializer(pessoa).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
def pessoas_retrieve_update(request, pk: int):
    try:
        pessoa = Pessoas.objects.get(pk=pk)
    except Pessoas.DoesNotExist:
        return Response({'error': 'Pessoa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PessoasSerializer(pessoa).data)

    partial = request.method == 'PATCH'
    payload = request.data.copy()
    if 'cnpj_cpf' in payload:
        payload['cnpj_cpf'] = ''.join(filter(str.isdigit, str(payload['cnpj_cpf'])))
    serializer = PessoasSerializer(pessoa, data=payload, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def pessoas_toggle_status(request, pk: int):
    try:
        pessoa = Pessoas.objects.get(pk=pk)
    except Pessoas.DoesNotExist:
        return Response({'error': 'Pessoa não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    pessoa.status = 'INATIVO' if pessoa.status == 'ATIVO' else 'ATIVO'
    pessoa.save(update_fields=['status'])
    return Response({'id': pessoa.id, 'status': pessoa.status})


# Classificacao CRUD e toggle
@api_view(['GET', 'POST'])
def classificacao_list_create(request):
    if request.method == 'GET':
        qs = Classificacao.objects.all()
        tipo = request.GET.get('tipo')
        status_param = request.GET.get('status')
        if tipo:
            qs = qs.filter(tipo=tipo)
        if status_param:
            qs = qs.filter(status=status_param)
        paginator = DefaultPagination()
        page = paginator.paginate_queryset(qs.order_by('id'), request)
        serializer = ClassificacaoSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    payload = request.data.copy()
    if payload.get('status') is None:
        payload['status'] = 'ATIVO'
    serializer = ClassificacaoSerializer(data=payload)
    if serializer.is_valid():
        obj = serializer.save()
        return Response(ClassificacaoSerializer(obj).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
def classificacao_retrieve_update(request, pk: int):
    try:
        obj = Classificacao.objects.get(pk=pk)
    except Classificacao.DoesNotExist:
        return Response({'error': 'Classificação não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ClassificacaoSerializer(obj).data)

    partial = request.method == 'PATCH'
    serializer = ClassificacaoSerializer(obj, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def classificacao_toggle_status(request, pk: int):
    try:
        obj = Classificacao.objects.get(pk=pk)
    except Classificacao.DoesNotExist:
        return Response({'error': 'Classificação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    obj.status = 'INATIVO' if obj.status == 'ATIVO' else 'ATIVO'
    obj.save(update_fields=['status'])
    return Response({'id': obj.id, 'status': obj.status})


@api_view(['POST'])
def extract_invoice(request):
    """
    Extrai dados de uma nota fiscal PDF usando IA
    """
    try:
        pdf_file = request.FILES.get('pdf_file')

        if not pdf_file:
            return Response(
                {"error": "Nenhum arquivo PDF foi enviado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        extrator_service = ExtratorFiscalService()
        dados_extraidos = extrator_service.extrair_dados_do_pdf(pdf_file)

        return Response(dados_extraidos, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Ocorreu um erro ao processar o arquivo: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def check_fornecedor(request):
    """
    Verifica se um fornecedor existe no banco de dados pelo CNPJ
    """
    try:
        cnpj = request.GET.get('cnpj')
        if not cnpj:
            return Response(
                {'error': 'CNPJ é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove caracteres especiais do CNPJ
        cnpj_clean = ''.join(filter(str.isdigit, cnpj))
        
        # Busca fornecedor pelo CNPJ
        fornecedor = Pessoas.objects.filter(
            cnpj_cpf=cnpj_clean,
            tipo='FORNECEDOR',
            status='ATIVO'
        ).first()
        
        if fornecedor:
            return Response({
                'exists': True,
                'id': fornecedor.id,
                'razaoSocial': fornecedor.razao_social,
                'cnpj': fornecedor.cnpj_cpf
            })
        else:
            return Response({
                'exists': False,
                'razaoSocial': request.GET.get('razaoSocial', '') or request.GET.get('razao_social', ''),
                'cnpj': cnpj
            })
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao consultar fornecedor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def check_faturado(request):
    """
    Verifica se um faturado existe no banco de dados pelo CPF
    """
    try:
        cpf = request.GET.get('cpf')
        if not cpf:
            return Response(
                {'error': 'CPF é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove caracteres especiais do CPF
        cpf_clean = ''.join(filter(str.isdigit, cpf))
        
        # Busca faturado pelo CPF
        faturado = Pessoas.objects.filter(
            cnpj_cpf=cpf_clean,
            tipo='FATURADO',
            status='ATIVO'
        ).first()
        
        if faturado:
            return Response({
                'exists': True,
                'id': faturado.id,
                'nome': faturado.razao_social,
                'cpf': faturado.cnpj_cpf
            })
        else:
            return Response({
                'exists': False,
                'nome': request.GET.get('nome', ''),
                'cpf': cpf
            })
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao consultar faturado: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def check_despesa(request):
    """
    Verifica se uma despesa existe no banco de dados pela descrição
    """
    try:
        descricao = request.GET.get('descricao')
        if not descricao:
            return Response(
                {'error': 'Descrição é obrigatória'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Busca despesa pela descrição
        despesa = Classificacao.objects.filter(
            descricao__iexact=descricao,
            tipo='DESPESA',
            status='ATIVO'
        ).first()
        
        if despesa:
            return Response({
                'exists': True,
                'id': despesa.id,
                'descricao': despesa.descricao
            })
        else:
            return Response({
                'exists': False,
                'descricao': descricao
            })
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao consultar despesa: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_fornecedor(request):
    """
    Cria um novo fornecedor
    """
    try:
        serializer = PessoasSerializer(data={
            'razao_social': request.data.get('razaoSocial'),
            'cnpj_cpf': request.data.get('cnpj'),
            'tipo': 'FORNECEDOR'
        })
        
        if serializer.is_valid():
            fornecedor = serializer.save()
            return Response({
                'id': fornecedor.id,
                'razao_social': fornecedor.razao_social,
                'cnpj': fornecedor.cnpj_cpf
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao criar fornecedor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_faturado(request):
    """
    Cria um novo faturado
    """
    try:
        serializer = PessoasSerializer(data={
            'razao_social': request.data.get('nome'),
            'cnpj_cpf': request.data.get('cpf'),
            'tipo': 'FATURADO'
        })
        
        if serializer.is_valid():
            faturado = serializer.save()
            return Response({
                'id': faturado.id,
                'nome': faturado.razao_social,
                'cpf': faturado.cnpj_cpf
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao criar faturado: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_despesa(request):
    """
    Cria uma nova despesa
    """
    try:
        serializer = ClassificacaoSerializer(data={
            'descricao': request.data.get('descricao'),
            'tipo': 'DESPESA'
        })
        
        if serializer.is_valid():
            despesa = serializer.save()
            return Response({
                'id': despesa.id,
                'descricao': despesa.descricao
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao criar despesa: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_movimento(request):
    """
    Cria um novo movimento (conta a pagar)
    """
    try:
        # Aceita tanto camelCase quanto snake_case
        payload = request.data.copy()
        mapping = {
            'fornecedorId': 'fornecedor_id',
            'faturadoId': 'faturado_id',
            'despesaId': 'despesa_id',
            'dataVencimento': 'data_vencimento',
            'numeroNotaFiscal': 'numero_nota_fiscal'
        }
        for camel, snake in mapping.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload[camel]

        if 'tipo' not in payload:
            payload['tipo'] = 'APAGAR'

        serializer = CreateMovimentoSerializer(data=payload)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Gera identificação única para o movimento
            identificacao = f"NF-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
            
            # Busca as entidades relacionadas
            try:
                fornecedor = Pessoas.objects.get(id=serializer.validated_data['fornecedor_id'])
                faturado = Pessoas.objects.get(id=serializer.validated_data['faturado_id'])
            except Pessoas.DoesNotExist as e:
                return Response(
                    {'error': f'Entidade não encontrada: {str(e)}'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Cria o movimento
            movimento = MovimentoContas.objects.create(
                identificacao=identificacao,
                tipo=serializer.validated_data.get('tipo', 'APAGAR'),
                numero_nota_fiscal=serializer.validated_data.get('numero_nota_fiscal', ''),
                descricao=serializer.validated_data.get('descricao', ''),
                fornecedor_cliente=fornecedor,
                faturado=faturado,
                valor_total=serializer.validated_data['valor'],
                observacoes=serializer.validated_data.get('observacoes', '')
            )

            # Vincula classificações
            classificacoes_ids = serializer.validated_data.get('classificacoes_ids')
            if classificacoes_ids:
                classificacoes = Classificacao.objects.filter(id__in=classificacoes_ids)
                movimento.classificacoes.set(classificacoes)
            else:
                # Mantém compatibilidade: se vier um único despesa_id
                despesa_id = serializer.validated_data.get('despesa_id')
                if despesa_id:
                    try:
                        despesa = Classificacao.objects.get(id=despesa_id)
                        movimento.classificacoes.add(despesa)
                    except Classificacao.DoesNotExist:
                        return Response({'error': 'Classificação (despesa) não encontrada'}, status=status.HTTP_404_NOT_FOUND)
            
            # Cria uma parcela
            data_vencimento = serializer.validated_data['data_vencimento']
            ParcelaContas.objects.create(
                movimento=movimento,
                identificacao=f"{identificacao}-P1",
                numero_parcela=1,
                valor_parcela=serializer.validated_data['valor'],
                data_vencimento=data_vencimento,
                valor_saldo=serializer.validated_data['valor']
            )
            
            # Retorna o movimento criado
            movimento_serializer = MovimentoContasSerializer(movimento)
            return Response({
                'id': movimento.id,
                'identificacao': movimento.identificacao,
                'success': True,
                'message': 'Registro lançado com sucesso!',
                'movimento': movimento_serializer.data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {'error': f'Erro ao criar movimento: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )