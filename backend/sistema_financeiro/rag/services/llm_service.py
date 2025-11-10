import google.generativeai as genai
from typing import List, Dict, Any
import os


class LLMService:
    def __init__(self):
        api_key = "AIzaSyA8bKUuPTuESQLRssVE4u-uLDPt8vlFCT8"
        if not api_key:
            raise ValueError("A variável de ambiente GEMINI_API_KEY não foi configurada.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_rag_response(
        self, 
        question: str, 
        context: List[Dict[str, Any]], 
        rag_type: str = "simple"
    ) -> str:
        """
        Gera uma resposta para a pergunta usando o contexto recuperado pelo RAG.
        
        Args:
            question: Pergunta do usuário
            context: Lista de dados recuperados do banco de dados
            rag_type: Tipo de RAG usado ("simple" ou "embeddings")
        
        Returns:
            Resposta gerada pelo LLM em linguagem natural
        """
        # Formata o contexto em uma string legível
        context_str = self._format_context(context)
        
        # Cria o prompt estruturado
        prompt = self._create_rag_prompt(question, context_str, rag_type)
        
        # Gera a resposta
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Erro ao gerar resposta: {str(e)}"
    
    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """
        Formata o contexto em uma string legível.
        
        Args:
            context: Lista de dicionários com dados do banco
        
        Returns:
            String formatada com o contexto
        """
        if not context:
            return "Nenhum dado relevante foi encontrado no banco de dados."
        
        formatted_parts = []
        for idx, item in enumerate(context, 1):
            item_type = item.get('type', 'dados')
            data = item.get('data', {})
            
            formatted_parts.append(f"\n--- {item_type.upper()} {idx} ---")
            for key, value in data.items():
                if value is not None:
                    formatted_parts.append(f"{key}: {value}")
        
        return "\n".join(formatted_parts)
    
    def _create_rag_prompt(
        self, 
        question: str, 
        context_str: str, 
        rag_type: str
    ) -> str:
        """
        Cria o prompt estruturado para o LLM.
        
        Args:
            question: Pergunta do usuário
            context_str: Contexto formatado
            rag_type: Tipo de RAG usado
        
        Returns:
            Prompt completo
        """
        prompt = f"""Você é um assistente especializado em análise de dados financeiros de um sistema de gestão de notas fiscais.

Contexto do Banco de Dados (recuperado usando RAG {rag_type}):
{context_str}

Pergunta do usuário: {question}

Instruções:
1. Analise o contexto fornecido acima
2. Responda a pergunta do usuário de forma clara e objetiva
3. Use APENAS as informações do contexto fornecido
4. Se o contexto não contiver informações suficientes, informe isso de forma educada
5. Formate números monetários em Real (R$)
6. Formate datas no padrão brasileiro (dd/mm/aaaa)
7. Seja conciso mas completo
8. Responda em português brasileiro

Resposta:"""
        
        return prompt
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Gera embedding para um texto usando a API do Gemini.
        Nota: Gemini não tem endpoint direto de embeddings, então vamos usar
        uma abordagem alternativa ou implementar com sentence-transformers.
        
        Args:
            text: Texto para gerar embedding
        
        Returns:
            Lista de floats representando o embedding
        """
        raise NotImplementedError(
            "Embeddings serão implementados usando sentence-transformers "
            "ou comparação semântica com Gemini"
        )

