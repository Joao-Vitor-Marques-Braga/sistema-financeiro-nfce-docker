from rest_framework import serializers
from .models import Pessoas, Classificacao, MovimentoContas, ParcelaContas


class PessoasSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Pessoas"""
    
    class Meta:
        model = Pessoas
        fields = ['id', 'razao_social', 'fantasia', 'cnpj_cpf', 'tipo', 'status', 'data_criacao', 'data_atualizacao']
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']
    
    def validate_cnpj_cpf(self, value):
        """Validação básica e normalização para CNPJ/CPF"""
        if not value:
            raise serializers.ValidationError("CNPJ/CPF é obrigatório")

        # Remove qualquer caractere não numérico e persiste somente dígitos
        cleaned_value = ''.join(filter(str.isdigit, value))

        if len(cleaned_value) not in [11, 14]:
            raise serializers.ValidationError(
                "CNPJ deve ter 14 dígitos ou CPF deve ter 11 dígitos"
            )

        # Retorna o valor normalizado para salvar já sem máscara
        return cleaned_value


class ClassificacaoSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Classificacao"""
    
    class Meta:
        model = Classificacao
        fields = ['id', 'descricao', 'tipo', 'status', 'data_criacao', 'data_atualizacao']
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']


class ParcelaContasSerializer(serializers.ModelSerializer):
    """Serializer para o modelo ParcelaContas"""
    
    class Meta:
        model = ParcelaContas
        fields = ['id', 'movimento', 'identificacao', 'numero_parcela', 'valor_parcela', 'data_vencimento', 
                 'data_pagamento', 'valor_pago', 'valor_saldo', 'status', 'data_criacao', 'data_atualizacao']
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']


class MovimentoContasSerializer(serializers.ModelSerializer):
    """Serializer para o modelo MovimentoContas"""
    parcelas = ParcelaContasSerializer(many=True, read_only=True)
    fornecedor_nome = serializers.CharField(source='fornecedor_cliente.razao_social', read_only=True)
    faturado_nome = serializers.CharField(source='faturado.razao_social', read_only=True)
    classificacoes = serializers.PrimaryKeyRelatedField(queryset=Classificacao.objects.all(), many=True)
    
    class Meta:
        model = MovimentoContas
        fields = ['id', 'identificacao', 'tipo', 'numero_nota_fiscal', 'data_emissao', 'descricao',
                 'fornecedor_cliente', 'fornecedor_nome', 'faturado', 'faturado_nome',
                 'classificacoes', 'valor_total', 'status', 'observacoes', 
                 'data_criacao', 'data_atualizacao', 'parcelas']
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao', 'parcelas', 'fornecedor_nome', 'faturado_nome']


class CheckFornecedorSerializer(serializers.Serializer):
    """Serializer para verificação de fornecedor"""
    cnpj = serializers.CharField(max_length=18)
    razao_social = serializers.CharField(max_length=255, required=False)


class CheckFaturadoSerializer(serializers.Serializer):
    """Serializer para verificação de faturado"""
    cpf = serializers.CharField(max_length=14)
    nome = serializers.CharField(max_length=255, required=False)


class CheckDespesaSerializer(serializers.Serializer):
    """Serializer para verificação de despesa"""
    descricao = serializers.CharField(max_length=255)


class CreateMovimentoSerializer(serializers.Serializer):
    """Serializer para criação de movimento"""
    fornecedor_id = serializers.IntegerField()
    faturado_id = serializers.IntegerField()
    despesa_id = serializers.IntegerField(required=False)
    classificacoes_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    valor = serializers.DecimalField(max_digits=15, decimal_places=2)
    data_vencimento = serializers.DateField()
    numero_nota_fiscal = serializers.CharField(required=False, allow_blank=True)
    descricao = serializers.CharField(required=False, allow_blank=True)
    observacoes = serializers.CharField(required=False, allow_blank=True)
    tipo = serializers.CharField(default='APAGAR')

    def validate(self, attrs):
        if not attrs.get('despesa_id') and not attrs.get('classificacoes_ids'):
            raise serializers.ValidationError('Informe "despesa_id" ou "classificacoes_ids".')
        return attrs
