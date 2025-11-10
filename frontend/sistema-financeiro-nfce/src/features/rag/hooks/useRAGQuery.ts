
import { useState, useCallback } from 'react';
import { RAGService } from '../services/ragService';
import type { RAGQueryRequest, RAGQueryResponse, RAGType } from '../types';

interface UseRAGQueryReturn {
  query: string;
  setQuery: (query: string) => void;
  ragType: RAGType;
  setRAGType: (type: RAGType) => void;
  response: RAGQueryResponse | null;
  loading: boolean;
  error: string | null;
  executeQuery: () => Promise<void>;
  clearResponse: () => void;
}

export function useRAGQuery(): UseRAGQueryReturn {
  const [query, setQuery] = useState('');
  const [ragType, setRAGType] = useState<RAGType>('simple');
  const [response, setResponse] = useState<RAGQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      setError('Por favor, digite uma pergunta');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const request: RAGQueryRequest = {
        question: query.trim(),
        rag_type: ragType,
      };

      const result = await RAGService.query(request);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar consulta');
    } finally {
      setLoading(false);
    }
  }, [query, ragType]);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    ragType,
    setRAGType,
    response,
    loading,
    error,
    executeQuery,
    clearResponse,
  };
}

