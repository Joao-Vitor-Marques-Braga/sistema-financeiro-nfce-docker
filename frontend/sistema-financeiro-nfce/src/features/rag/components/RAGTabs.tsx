import type { RAGType } from '../types';

interface RAGTabsProps {
  ragType: RAGType;
  onRAGTypeChange: (type: RAGType) => void;
}

export default function RAGTabs({ ragType, onRAGTypeChange }: RAGTabsProps) {
  return (
    <div className="flex space-x-2 mb-4 border-b border-gray-200">
      <button
        onClick={() => onRAGTypeChange('simple')}
        className={`px-4 py-2 font-medium text-sm transition-colors ${
          ragType === 'simple'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        RAG Simples
      </button>
      <button
        onClick={() => onRAGTypeChange('embeddings')}
        className={`px-4 py-2 font-medium text-sm transition-colors ${
          ragType === 'embeddings'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        RAG Embeddings
      </button>
    </div>
  );
}

