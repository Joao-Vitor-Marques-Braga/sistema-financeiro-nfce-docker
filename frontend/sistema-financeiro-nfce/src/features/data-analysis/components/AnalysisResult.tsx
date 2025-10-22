import type { DataAnalysisResult } from '../types'

interface AnalysisResultProps {
  result: DataAnalysisResult
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const StatusBadge = ({ status, id }: { status: string, id?: number }) => {
    const isExists = status === 'EXISTS'
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isExists 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isExists ? 'EXISTE' : 'NÃO EXISTE'}
        {isExists && id && (
          <span className="ml-2 text-xs bg-green-200 text-green-900 px-2 py-0.5 rounded">
            ID: {id}
          </span>
        )}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado da Análise</h3>
      
      {/* Fornecedor */}
      <div className="border-l-4 border-blue-500 pl-4">
        <h4 className="font-medium text-gray-900 mb-2">FORNECEDOR</h4>
        <div className="space-y-1">
          <p className="text-gray-700">
            <span className="font-medium">Razão Social:</span> {result.fornecedor.razaoSocial}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">CNPJ:</span> {result.fornecedor.cnpj}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Status:</span>
            <StatusBadge status={result.fornecedor.status} id={result.fornecedor.id} />
          </div>
        </div>
      </div>

      {/* Faturado */}
      <div className="border-l-4 border-green-500 pl-4">
        <h4 className="font-medium text-gray-900 mb-2">FATURADO</h4>
        <div className="space-y-1">
          <p className="text-gray-700">
            <span className="font-medium">Nome:</span> {result.faturado.nome}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">CPF:</span> {result.faturado.cpf}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Status:</span>
            <StatusBadge status={result.faturado.status} id={result.faturado.id} />
          </div>
        </div>
      </div>

      {/* Despesa */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h4 className="font-medium text-gray-900 mb-2">DESPESA</h4>
        <div className="space-y-1">
          <p className="text-gray-700">
            <span className="font-medium">Descrição:</span> {result.despesa.descricao}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Status:</span>
            <StatusBadge status={result.despesa.status} id={result.despesa.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
