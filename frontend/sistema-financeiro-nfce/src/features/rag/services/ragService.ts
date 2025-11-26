import type { RAGQueryRequest, RAGQueryResponse, RAGError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/rag`
  : 'https://joaovitormb.pythonanywhere.com/rag';

export class RAGService {
  static async query(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: RAGError = await response.json();
        throw new Error(errorData.error || 'Erro ao processar consulta RAG');
      }

      const data: RAGQueryResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao processar consulta RAG');
    }
  }
}

