/**
 * Página principal para consultas RAG
 */

import { useRAGQuery } from './hooks/useRAGQuery';
import RAGTabs from './components/RAGTabs';
import RAGQueryInput from './components/RAGQueryInput';
import RAGResponse from './components/RAGResponse';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';

export default function RAGPage() {
  const {
    query,
    setQuery,
    ragType,
    setRAGType,
    response,
    loading,
    error,
    executeQuery,
    clearResponse,
  } = useRAGQuery();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Consulta Inteligente com RAG
          </h1>

          <RAGTabs ragType={ragType} onRAGTypeChange={setRAGType} />

          <RAGQueryInput
            query={query}
            onQueryChange={(newQuery) => {
              setQuery(newQuery);
              if (response || error) {
                clearResponse();
              }
            }}
            onExecute={executeQuery}
            loading={loading}
          />

          {error && (
            <ErrorAlert
              message={error}
              onClose={clearResponse}
            />
          )}

          {loading && <LoadingSpinner />}

          {response && !loading && <RAGResponse response={response} />}

          {!response && !loading && !error && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Exemplos de perguntas:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li>Quantos fornecedores temos cadastrados?</li>
                <li>Qual o total de contas a pagar?</li>
                <li>Quais são as parcelas vencidas?</li>
                <li>Liste os movimentos do último mês</li>
                <li>Qual a receita total?</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

