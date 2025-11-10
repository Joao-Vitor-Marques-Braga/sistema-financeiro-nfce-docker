from typing import List, Dict, Any
import re
from django.db.models import Q
from sistema_financeiro.extrator_fiscal.models import (
    Pessoas, Classificacao, MovimentoContas, ParcelaContas
)


class RAGEmbeddingsService:
    def __init__(self):
        self.context_limit = 10
    
    def search(self, question: str) -> List[Dict[str, Any]]:
        """
        Busca dados relevantes usando análise semântica.
        
        Args:
            question: Pergunta do usuário em linguagem natural
        
        Returns:
            Lista de dicionários com dados recuperados
        """
        # Primeiro, faz uma busca ampla para ter candidatos
        candidates = self._get_all_candidates()
        
        # Usa análise semântica para filtrar e ranquear
        relevant_results = self._semantic_filter(question, candidates)
        
        return relevant_results[:20]
    
    def _get_all_candidates(self) -> List[Dict[str, Any]]:
        """
        Obtém candidatos de todas as entidades.
        
        Returns:
            Lista de candidatos
        """
        candidates = []
        
        # Pessoas
        pessoas = Pessoas.objects.all()[:50]
        for pessoa in pessoas:
            text_representation = f"{pessoa.razao_social} {pessoa.fantasia or ''} {pessoa.cnpj_cpf} {pessoa.get_tipo_display()}"
            candidates.append({
                'type': 'pessoa',
                'text': text_representation,
                'data': {
                    'id': pessoa.id,
                    'razao_social': pessoa.razao_social,
                    'fantasia': pessoa.fantasia,
                    'cnpj_cpf': pessoa.cnpj_cpf,
                    'tipo': pessoa.get_tipo_display(),
                    'status': pessoa.get_status_display()
                }
            })
        
        # Classificações
        classificacoes = Classificacao.objects.filter(status='ATIVO')[:50]
        for classificacao in classificacoes:
            text_representation = f"{classificacao.descricao} {classificacao.get_tipo_display()}"
            candidates.append({
                'type': 'classificacao',
                'text': text_representation,
                'data': {
                    'id': classificacao.id,
                    'descricao': classificacao.descricao,
                    'tipo': classificacao.get_tipo_display(),
                    'status': classificacao.get_status_display()
                }
            })
        
        # Movimentos
        movimentos = MovimentoContas.objects.select_related(
            'fornecedor_cliente', 'faturado'
        ).prefetch_related('classificacoes')[:50]
        
        for movimento in movimentos:
            fornecedor_nome = movimento.fornecedor_cliente.razao_social if movimento.fornecedor_cliente else ''
            faturado_nome = movimento.faturado.razao_social if movimento.faturado else ''
            classificacoes = ' '.join([c.descricao for c in movimento.classificacoes.all()])
            
            text_representation = (
                f"{movimento.identificacao} {movimento.descricao} "
                f"{movimento.numero_nota_fiscal} {fornecedor_nome} {faturado_nome} "
                f"{classificacoes} {movimento.get_tipo_display()} R$ {movimento.valor_total}"
            )
            
            candidates.append({
                'type': 'movimento',
                'text': text_representation,
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
                    'classificacoes': [c.descricao for c in movimento.classificacoes.all()]
                }
            })
        
        # Parcelas
        parcelas = ParcelaContas.objects.select_related('movimento')[:50]
        for parcela in parcelas:
            text_representation = (
                f"{parcela.identificacao} {parcela.movimento.identificacao} "
                f"parcela {parcela.numero_parcela} vencimento {parcela.data_vencimento} "
                f"R$ {parcela.valor_parcela} {parcela.get_status_display()}"
            )
            
            candidates.append({
                'type': 'parcela',
                'text': text_representation,
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
        
        return candidates
    
    def _semantic_filter(self, question: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filtra candidatos usando análise semântica simplificada.
        
        Como não temos embeddings vetoriais, usamos uma abordagem híbrida:
        1. Extrai palavras-chave da pergunta
        2. Faz matching semântico simples
        3. Ranqueia por relevância
        
        Args:
            question: Pergunta do usuário
            candidates: Lista de candidatos
        
        Returns:
            Lista filtrada e ranqueada
        """
        question_lower = question.lower()
        question_words = set(re.findall(r'\b\w+\b', question_lower))
        
        # Remove palavras muito comuns
        stop_words = {'qual', 'quais', 'quanto', 'quantos', 'como', 'onde', 'quando', 
                     'de', 'da', 'do', 'em', 'para', 'com', 'por', 'é', 'são', 'o', 'a', 'os', 'as'}
        question_words = question_words - stop_words
        
        scored_candidates = []
        
        for candidate in candidates:
            text = candidate['text'].lower()
            text_words = set(re.findall(r'\b\w+\b', text))
            
            # Calcula score de relevância
            # 1. Intersecção de palavras
            common_words = question_words & text_words
            word_score = len(common_words) / max(len(question_words), 1)
            
            # 2. Matching de frases importantes
            phrase_score = 0
            important_phrases = self._extract_important_phrases(question_lower)
            for phrase in important_phrases:
                if phrase in text:
                    phrase_score += 0.3
            
            # 3. Score combinado
            total_score = word_score * 0.7 + phrase_score * 0.3
            
            scored_candidates.append({
                'candidate': candidate,
                'score': total_score
            })
        
        # Ordena por score
        scored_candidates.sort(key=lambda x: x['score'], reverse=True)
        
        # Retorna apenas os mais relevantes (score > 0)
        relevant = [item['candidate'] for item in scored_candidates if item['score'] > 0]
        
        # Remove o campo 'text' antes de retornar
        for item in relevant:
            if 'text' in item:
                del item['text']
        
        return relevant
    
    def _extract_important_phrases(self, question: str) -> List[str]:
        """
        Extrai frases importantes da pergunta.
        
        Args:
            question: Pergunta em minúsculas
        
        Returns:
            Lista de frases importantes
        """
        phrases = []
        
        # Frases comuns em perguntas financeiras
        common_phrases = [
            'contas a pagar',
            'contas a receber',
            'parcelas vencidas',
            'valor total',
            'nota fiscal',
            'data de vencimento',
            'fornecedor',
            'cliente',
            'faturado'
        ]
        
        for phrase in common_phrases:
            if phrase in question:
                phrases.append(phrase)
        
        return phrases

