import type { RAGQueryResponse } from '../types';

interface RAGResponseProps {
  response: RAGQueryResponse;
}

export default function RAGResponse({ response }: RAGResponseProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Resposta</h3>
          <span className="text-xs text-gray-500">
            {response.execution_time}s • {response.rag_type === 'simple' ? 'RAG Simples' : 'RAG Embeddings'}
          </span>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{response.answer}</p>
        </div>
      </div>

      {response.context && response.context.length > 0 && (
        <div className="bg-gray-50 rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Contexto Utilizado ({response.context.length} itens)
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {response.context.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-blue-600 uppercase">
                    {item.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {Object.entries(item.data).map(([key, value]) => {
                    if (value === null || value === undefined) return null;
                    return (
                      <div key={key} className="flex">
                        <span className="font-medium text-gray-700 mr-2">
                          {key}:
                        </span>
                        <span className="text-gray-600">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

