from rest_framework import serializers


class RAGQuerySerializer(serializers.Serializer):
    question = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=1000,
        help_text="Pergunta em linguagem natural sobre o banco de dados"
    )
    rag_type = serializers.ChoiceField(
        choices=['simple', 'embeddings'],
        default='simple',
        help_text="Tipo de RAG a ser usado: 'simple' para busca textual, 'embeddings' para busca semântica"
    )


class RAGResponseSerializer(serializers.Serializer):
    answer = serializers.CharField(
        help_text="Resposta gerada pelo LLM"
    )
    context = serializers.ListField(
        help_text="Contexto recuperado do banco de dados"
    )
    rag_type = serializers.CharField(
        help_text="Tipo de RAG usado"
    )
    execution_time = serializers.FloatField(
        help_text="Tempo de execução em segundos"
    )

