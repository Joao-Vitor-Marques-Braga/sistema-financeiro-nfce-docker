
import time
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import RAGQuerySerializer
from .services.rag_simple_service import RAGSimpleService
from .services.rag_embeddings_service import RAGEmbeddingsService
from .services.llm_service import LLMService


@api_view(['POST'])
def rag_query(request):
    """
    Endpoint para consultas RAG.
    
    Recebe uma pergunta em linguagem natural e retorna uma resposta
    elaborada usando RAG (Retrieval-Augmented Generation).
    
    Body:
        {
            "question": "Qual o total de contas a pagar?",
            "rag_type": "simple" | "embeddings"
        }
    
    Returns:
        {
            "answer": "Resposta gerada pelo LLM",
            "context": [...],
            "rag_type": "simple",
            "execution_time": 1.23
        }
    """
    start_time = time.time()
    
    # Valida entrada
    serializer = RAGQuerySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    question = serializer.validated_data['question']
    rag_type = serializer.validated_data['rag_type']
    
    try:
        # Seleciona o serviço RAG apropriado
        if rag_type == 'simple':
            rag_service = RAGSimpleService()
        elif rag_type == 'embeddings':
            rag_service = RAGEmbeddingsService()
        else:
            return Response(
                {'error': f'Tipo de RAG inválido: {rag_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Busca contexto no banco de dados
        context = rag_service.search(question)
        
        # Gera resposta usando LLM
        llm_service = LLMService()
        answer = llm_service.generate_rag_response(
            question=question,
            context=context,
            rag_type=rag_type
        )
        
        execution_time = time.time() - start_time
        
        # Retorna resposta
        return Response({
            'answer': answer,
            'context': context,
            'rag_type': rag_type,
            'execution_time': round(execution_time, 2)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {
                'error': f'Erro ao processar consulta RAG: {str(e)}',
                'question': question,
                'rag_type': rag_type
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

