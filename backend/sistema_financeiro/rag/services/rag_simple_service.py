"""
Serviço RAG Simples - Busca textual nos modelos do banco de dados.
"""
from typing import List, Dict, Any
import re
from django.db.models import Q
from sistema_financeiro.extrator_fiscal.models import (
    Pessoas, Classificacao, MovimentoContas, ParcelaContas
)


class RAGSimpleService:
    """
    Serviço para busca textual simples nos modelos do banco de dados.
    """
    
    def __init__(self):
        self.context_limit = 10  # Limite de resultados por tipo de entidade
    
    def search(self, question: str) -> List[Dict[str, Any]]:
        """
        Busca dados relevantes no banco de dados baseado na pergunta.
        
        Args:
            question: Pergunta do usuário em linguagem natural
        
        Returns:
            Lista de dicionários com dados recuperados
        """
        question_lower = question.lower()
        results = []
        
        # Identifica entidades e intenções na pergunta
        entities = self._extract_entities(question_lower)
        intent = self._identify_intent(question_lower)
        
        # Busca em Pessoas
        if self._should_search_pessoas(question_lower, entities, intent):
            pessoas_results = self._search_pessoas(question_lower, entities)
            results.extend(pessoas_results)
        
        # Busca em Classificacao
        if self._should_search_classificacao(question_lower, entities, intent):
            classificacao_results = self._search_classificacao(question_lower, entities)
            results.extend(classificacao_results)
        
        # Busca em MovimentoContas
        if self._should_search_movimentos(question_lower, entities, intent):
            movimentos_results = self._search_movimentos(question_lower, entities)
            results.extend(movimentos_results)
        
        # Busca em ParcelaContas
        if self._should_search_parcelas(question_lower, entities, intent):
            parcelas_results = self._search_parcelas(question_lower, entities)
            results.extend(parcelas_results)
        
        # Se não encontrou nada, faz uma busca genérica
        if not results:
            results = self._generic_search(question_lower)
        
        return results[:20]  # Limite total de resultados
    
    def _extract_entities(self, question: str) -> Dict[str, Any]:
        """
        Extrai entidades da pergunta (nomes, valores, datas, etc).
        
        Args:
            question: Pergunta em minúsculas
        
        Returns:
            Dicionário com entidades extraídas
        """
        entities = {
            'tipos_pessoas': [],
            'valores': [],
            'datas': [],
            'numeros': [],
            'palavras_chave': []
        }
        
        # Identifica tipos de pessoas
        if 'fornecedor' in question:
            entities['tipos_pessoas'].append('FORNECEDOR')
        if 'cliente' in question:
            entities['tipos_pessoas'].append('CLIENTE')
        if 'faturado' in question:
            entities['tipos_pessoas'].append('FATURADO')
        
        # Identifica valores monetários
        valor_pattern = r'r\$\s*([\d.,]+)|([\d.,]+)\s*reais?'
        valores = re.findall(valor_pattern, question)
        if valores:
            entities['valores'] = [v[0] or v[1] for v in valores]
        
        # Identifica números
        numeros = re.findall(r'\d+', question)
        entities['numeros'] = numeros
        
        # Palavras-chave importantes
        keywords = ['total', 'soma', 'quantidade', 'quantos', 'lista', 'listar', 
                   'vencido', 'vencimento', 'pagar', 'receber', 'ativo', 'inativo']
        entities['palavras_chave'] = [kw for kw in keywords if kw in question]
        
        return entities
    
    def _identify_intent(self, question: str) -> str:
        """
        Identifica a intenção da pergunta.
        
        Args:
            question: Pergunta em minúsculas
        
        Returns:
            Intenção identificada
        """
        if any(word in question for word in ['quantos', 'quantidade', 'total', 'soma']):
            return 'contagem_agregacao'
        elif any(word in question for word in ['lista', 'listar', 'mostre', 'mostrar']):
            return 'listagem'
        elif any(word in question for word in ['vencido', 'vencimento', 'prazo']):
            return 'vencimentos'
        elif any(word in question for word in ['valor', 'preço', 'custo']):
            return 'valores'
        else:
            return 'consulta_geral'
    
    def _should_search_pessoas(self, question: str, entities: Dict, intent: str) -> bool:
        """Verifica se deve buscar em Pessoas."""
        return (
            any(word in question for word in ['fornecedor', 'cliente', 'faturado', 'pessoa', 'pessoas']) or
            entities['tipos_pessoas'] or
            intent == 'contagem_agregacao'
        )
    
    def _should_search_classificacao(self, question: str, entities: Dict, intent: str) -> bool:
        """Verifica se deve buscar em Classificacao."""
        return (
            any(word in question for word in ['classificacao', 'classificação', 'despesa', 'receita', 'categoria']) or
            intent == 'consulta_geral'
        )
    
    def _should_search_movimentos(self, question: str, entities: Dict, intent: str) -> bool:
        """Verifica se deve buscar em MovimentoContas."""
        return (
            any(word in question for word in ['movimento', 'conta', 'nota', 'fiscal', 'pagar', 'receber']) or
            entities['valores'] or
            intent in ['contagem_agregacao', 'valores', 'listagem']
        )
    
    def _should_search_parcelas(self, question: str, entities: Dict, intent: str) -> bool:
        """Verifica se deve buscar em ParcelaContas."""
        return (
            any(word in question for word in ['parcela', 'parcelas', 'vencido', 'vencimento', 'vencer']) or
            intent == 'vencimentos'
        )
    
    def _search_pessoas(self, question: str, entities: Dict) -> List[Dict[str, Any]]:
        """Busca em Pessoas."""
        results = []
        queryset = Pessoas.objects.all()
        
        # Filtra por tipo se mencionado
        if entities['tipos_pessoas']:
            queryset = queryset.filter(tipo__in=entities['tipos_pessoas'])
        else:
            # Busca genérica
            palavras = question.split()
            q_objects = Q()
            for palavra in palavras:
                if len(palavra) > 3:  # Ignora palavras muito curtas
                    q_objects |= Q(razao_social__icontains=palavra)
                    q_objects |= Q(fantasia__icontains=palavra)
                    q_objects |= Q(cnpj_cpf__icontains=palavra)
            if q_objects:
                queryset = queryset.filter(q_objects)
        
        # Limita resultados
        pessoas = queryset[:self.context_limit]
        
        for pessoa in pessoas:
            results.append({
                'type': 'pessoa',
                'data': {
                    'id': pessoa.id,
                    'razao_social': pessoa.razao_social,
                    'fantasia': pessoa.fantasia,
                    'cnpj_cpf': pessoa.cnpj_cpf,
                    'tipo': pessoa.get_tipo_display(),
                    'status': pessoa.get_status_display()
                }
            })
        
        return results
    
    def _search_classificacao(self, question: str, entities: Dict) -> List[Dict[str, Any]]:
        """Busca em Classificacao."""
        results = []
        queryset = Classificacao.objects.filter(status='ATIVO')
        
        # Busca por palavras-chave
        palavras = question.split()
        q_objects = Q()
        for palavra in palavras:
            if len(palavra) > 3:
                q_objects |= Q(descricao__icontains=palavra)
        if q_objects:
            queryset = queryset.filter(q_objects)
        
        classificacoes = queryset[:self.context_limit]
        
        for classificacao in classificacoes:
            results.append({
                'type': 'classificacao',
                'data': {
                    'id': classificacao.id,
                    'descricao': classificacao.descricao,
                    'tipo': classificacao.get_tipo_display(),
                    'status': classificacao.get_status_display()
                }
            })
        
        return results
    
    def _search_movimentos(self, question: str, entities: Dict) -> List[Dict[str, Any]]:
        """Busca em MovimentoContas."""
        results = []
        queryset = MovimentoContas.objects.select_related(
            'fornecedor_cliente', 'faturado'
        ).prefetch_related('classificacoes')
        
        # Filtra por tipo se mencionado
        if 'pagar' in question:
            queryset = queryset.filter(tipo='APAGAR')
        elif 'receber' in question:
            queryset = queryset.filter(tipo='ARECEBER')
        
        # Busca por palavras-chave
        palavras = question.split()
        q_objects = Q()
        for palavra in palavras:
            if len(palavra) > 3:
                q_objects |= Q(identificacao__icontains=palavra)
                q_objects |= Q(descricao__icontains=palavra)
                q_objects |= Q(numero_nota_fiscal__icontains=palavra)
                q_objects |= Q(fornecedor_cliente__razao_social__icontains=palavra)
                q_objects |= Q(faturado__razao_social__icontains=palavra)
        if q_objects:
            queryset = queryset.filter(q_objects)
        
        movimentos = queryset[:self.context_limit]
        
        for movimento in movimentos:
            fornecedor_nome = movimento.fornecedor_cliente.razao_social if movimento.fornecedor_cliente else None
            faturado_nome = movimento.faturado.razao_social if movimento.faturado else None
            classificacoes = [c.descricao for c in movimento.classificacoes.all()]
            
            results.append({
                'type': 'movimento',
                'data': {
                    'id': movimento.id,
                    'identificacao': movimento.identificacao,
                    'tipo': movimento.get_tipo_display(),
                    'numero_nota_fiscal': movimento.numero_nota_fiscal,
                    'data_emissao': movimento.data_emissao.strftime('%d/%m/%Y') if movimento.data_emissao else None,
                    'descricao': movimento.descricao,
                    'fornecedor_cliente': fornecedor_nome,
                    'faturado': faturado_nome,
                    'valor_total': float(movimento.valor_total),
                    'status': movimento.get_status_display(),
                    'classificacoes': classificacoes
                }
            })
        
        return results
    
    def _search_parcelas(self, question: str, entities: Dict) -> List[Dict[str, Any]]:
        """Busca em ParcelaContas."""
        results = []
        queryset = ParcelaContas.objects.select_related('movimento')
        
        # Filtra por vencidas se mencionado
        from datetime import date
        if 'vencido' in question or 'vencimento' in question:
            queryset = queryset.filter(
                data_vencimento__lt=date.today(),
                status__in=['PENDENTE', 'VENCIDO']
            )
        
        # Busca por palavras-chave
        palavras = question.split()
        q_objects = Q()
        for palavra in palavras:
            if len(palavra) > 3:
                q_objects |= Q(identificacao__icontains=palavra)
                q_objects |= Q(movimento__identificacao__icontains=palavra)
        if q_objects:
            queryset = queryset.filter(q_objects)
        
        parcelas = queryset[:self.context_limit]
        
        for parcela in parcelas:
            results.append({
                'type': 'parcela',
                'data': {
                    'id': parcela.id,
                    'identificacao': parcela.identificacao,
                    'movimento': parcela.movimento.identificacao,
                    'numero_parcela': parcela.numero_parcela,
                    'valor_parcela': float(parcela.valor_parcela),
                    'data_vencimento': parcela.data_vencimento.strftime('%d/%m/%Y'),
                    'data_pagamento': parcela.data_pagamento.strftime('%d/%m/%Y') if parcela.data_pagamento else None,
                    'valor_pago': float(parcela.valor_pago),
                    'valor_saldo': float(parcela.valor_saldo),
                    'status': parcela.get_status_display()
                }
            })
        
        return results
    
    def _generic_search(self, question: str) -> List[Dict[str, Any]]:
        """
        Busca genérica quando não há resultados específicos.
        Retorna informações agregadas do banco de dados.
        """
        results = []
        
        # Contagem de pessoas
        total_pessoas = Pessoas.objects.count()
        total_fornecedores = Pessoas.objects.filter(tipo='FORNECEDOR').count()
        total_clientes = Pessoas.objects.filter(tipo='CLIENTE').count()
        
        results.append({
            'type': 'estatisticas',
            'data': {
                'total_pessoas': total_pessoas,
                'total_fornecedores': total_fornecedores,
                'total_clientes': total_clientes
            }
        })
        
        # Contagem de movimentos
        total_movimentos = MovimentoContas.objects.count()
        total_a_pagar = MovimentoContas.objects.filter(tipo='APAGAR').count()
        total_a_receber = MovimentoContas.objects.filter(tipo='ARECEBER').count()
        
        results.append({
            'type': 'estatisticas',
            'data': {
                'total_movimentos': total_movimentos,
                'total_a_pagar': total_a_pagar,
                'total_a_receber': total_a_receber
            }
        })
        
        return results

