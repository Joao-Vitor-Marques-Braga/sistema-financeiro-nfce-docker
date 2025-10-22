from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Pessoas(models.Model):
    """
    Modelo para armazenar informações de pessoas (clientes, fornecedores, faturados)
    Fiel ao DER: inclui fantasia, documento e status textual.
    """
    TIPO_CHOICES = [
        ('CLIENTE', 'Cliente'),
        ('FORNECEDOR', 'Fornecedor'),
        ('FATURADO', 'Faturado'),
    ]

    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('INATIVO', 'Inativo'),
    ]

    razao_social = models.CharField(max_length=150, verbose_name="Razão Social")
    fantasia = models.CharField(max_length=150, blank=True, null=True, verbose_name="Fantasia")
    # Mantemos o nome do campo em código como cnpj_cpf para compatibilidade,
    # mas gravando na coluna 'documento' conforme DER
    cnpj_cpf = models.CharField(max_length=45, unique=True, db_column='documento', verbose_name="Documento")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo")
    status = models.CharField(max_length=45, choices=STATUS_CHOICES, default='ATIVO', verbose_name="Status")
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"
        indexes = [
            models.Index(fields=['cnpj_cpf']),
            models.Index(fields=['tipo']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.razao_social} ({self.get_tipo_display()})"


class Classificacao(models.Model):
    """
    Modelo para armazenar classificações de receitas e despesas
    """
    TIPO_CHOICES = [
        ('RECEITA', 'Receita'),
        ('DESPESA', 'Despesa'),
    ]

    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('INATIVO', 'Inativo'),
    ]

    descricao = models.CharField(max_length=150, verbose_name="Descrição")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo")
    status = models.CharField(max_length=45, choices=STATUS_CHOICES, default='ATIVO', verbose_name="Status")
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    class Meta:
        verbose_name = "Classificação"
        verbose_name_plural = "Classificações"
        unique_together = ['descricao', 'tipo']
        indexes = [
            models.Index(fields=['tipo']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.descricao} ({self.get_tipo_display()})"


class MovimentoContas(models.Model):
    """
    Modelo para armazenar movimentos de contas (a pagar e a receber)
    Fiel ao DER: inclui FKs separadas para fornecedor/cliente e faturado,
    campos de nota e relação M2M com Classificação.
    """
    TIPO_CHOICES = [
        ('APAGAR', 'A Pagar'),
        ('ARECEBER', 'A Receber'),
    ]

    STATUS_CHOICES = [
        ('ABERTO', 'Aberto'),
        ('LIQUIDADO', 'Liquidado'),
        ('CANCELADO', 'Cancelado'),
    ]

    identificacao = models.CharField(max_length=100, unique=True, verbose_name="Identificação")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo")
    numero_nota_fiscal = models.CharField(max_length=45, blank=True, verbose_name="Número Nota Fiscal")
    data_emissao = models.DateField(null=True, blank=True, verbose_name="Data de Emissão")
    descricao = models.CharField(max_length=300, blank=True, verbose_name="Descrição")
    fornecedor_cliente = models.ForeignKey(
        Pessoas,
        on_delete=models.PROTECT,
        related_name='movimentos_como_fornecedor',
        verbose_name="Pessoa (Fornecedor/Cliente)",
        null=True,
        blank=True
    )
    faturado = models.ForeignKey(
        Pessoas,
        on_delete=models.PROTECT,
        related_name='movimentos_como_faturado',
        verbose_name="Pessoa (Faturado)",
        null=True,
        blank=True
    )
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0.01)], verbose_name="Valor Total")
    status = models.CharField(max_length=45, choices=STATUS_CHOICES, default='ABERTO', verbose_name="Status")
    observacoes = models.TextField(blank=True, null=True, verbose_name="Observações")
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    # M2M com Classificacao (tabela de junção implícita)
    classificacoes = models.ManyToManyField(Classificacao, related_name='movimentos', verbose_name="Classificações")

    class Meta:
        verbose_name = "Movimento de Contas"
        verbose_name_plural = "Movimentos de Contas"
        indexes = [
            models.Index(fields=['tipo']),
            models.Index(fields=['fornecedor_cliente']),
            models.Index(fields=['faturado']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.identificacao} - {self.fornecedor_cliente.razao_social}"


class ParcelaContas(models.Model):
    """
    Modelo para armazenar parcelas dos movimentos de contas
    Fiel ao DER: inclui identificação única e saldo.
    """
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('PAGO', 'Pago'),
        ('VENCIDO', 'Vencido'),
        ('CANCELADO', 'Cancelado'),
    ]

    movimento = models.ForeignKey(MovimentoContas, on_delete=models.CASCADE, related_name='parcelas', verbose_name="Movimento")
    identificacao = models.CharField(max_length=45, unique=True, verbose_name="Identificação", null=True, blank=True)
    numero_parcela = models.PositiveIntegerField(verbose_name="Número da Parcela")
    valor_parcela = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0.01)], verbose_name="Valor da Parcela")
    data_vencimento = models.DateField(verbose_name="Data de Vencimento")
    data_pagamento = models.DateField(null=True, blank=True, verbose_name="Data de Pagamento")
    valor_pago = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name="Valor Pago")
    valor_saldo = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name="Valor Saldo")
    status = models.CharField(max_length=45, choices=STATUS_CHOICES, default='PENDENTE', verbose_name="Status Parcela")
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    class Meta:
        verbose_name = "Parcela de Contas"
        verbose_name_plural = "Parcelas de Contas"
        unique_together = ['movimento', 'numero_parcela']
        indexes = [
            models.Index(fields=['movimento']),
            models.Index(fields=['data_vencimento']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Parcela {self.numero_parcela} - {self.movimento.identificacao}"
