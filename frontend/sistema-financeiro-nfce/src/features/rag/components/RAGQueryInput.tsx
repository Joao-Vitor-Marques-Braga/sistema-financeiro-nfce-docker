interface RAGQueryInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onExecute: () => void;
  loading: boolean;
}

export default function RAGQueryInput({
  query,
  onQueryChange,
  onExecute,
  loading,
}: RAGQueryInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!loading && query.trim()) {
        onExecute();
      }
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="rag-query"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Faça sua pergunta sobre o banco de dados
      </label>
      <textarea
        id="rag-query"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ex: Quantos fornecedores temos cadastrados? Qual o total de contas a pagar?"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={4}
        disabled={loading}
      />
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Pressione Ctrl+Enter para enviar
        </p>
        <button
          onClick={onExecute}
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}

