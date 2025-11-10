export type RAGType = 'simple' | 'embeddings';

export interface RAGQueryRequest {
  question: string;
  rag_type: RAGType;
}

export interface RAGContextItem {
  type: string;
  data: Record<string, any>;
}

export interface RAGQueryResponse {
  answer: string;
  context: RAGContextItem[];
  rag_type: RAGType;
  execution_time: number;
}

export interface RAGError {
  error: string;
  question?: string;
  rag_type?: RAGType;
}

