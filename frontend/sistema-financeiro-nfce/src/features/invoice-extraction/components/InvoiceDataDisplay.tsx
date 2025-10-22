import React from "react"
import type { InvoiceData } from "../types"

interface Props {
  data: InvoiceData | null | undefined
}

export function InvoiceDataDisplay({ data }: Props) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Verificação de segurança para dados incompletos
  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-yellow-800 font-medium">Dados da nota fiscal incompletos ou não disponíveis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Nota Fiscal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium text-gray-700">Número:</span> {data.numero || 'N/A'}</p>
            <p><span className="font-medium text-gray-700">Série:</span> {data.serie || 'N/A'}</p>
          </div>
          <div>
            <p><span className="font-medium text-gray-700">Data de Emissão:</span> {data.emissao || 'N/A'}</p>
            <p><span className="font-medium text-gray-700">Valor Total:</span> R$ {data.totais?.total?.toFixed(2) || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Emitente */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Emitente (Fornecedor)</h3>
        <div className="text-sm">
          <p><span className="font-medium text-blue-800">Nome:</span> {data.emitente?.nome || 'N/A'}</p>
          <p><span className="font-medium text-blue-800">CNPJ:</span> {data.emitente?.cnpj || 'N/A'}</p>
        </div>
      </div>

      {/* Destinatário */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Destinatário (Faturado)</h3>
        <div className="text-sm">
          <p><span className="font-medium text-green-800">Nome:</span> {data.destinatario?.nome || 'N/A'}</p>
          <p><span className="font-medium text-green-800">CNPJ/CPF:</span> {data.destinatario?.cnpj || 'N/A'}</p>
        </div>
      </div>

      {/* Itens */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens da Nota</h3>
        <div className="space-y-2">
          {data.itens && data.itens.length > 0 ? (
            data.itens.map((item, index) => (
              <div key={index} className="bg-white rounded p-3 text-sm">
                <p><span className="font-medium">Descrição:</span> {item.descricao || 'N/A'}</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <p><span className="font-medium">Qtd:</span> {item.quantidade || 'N/A'}</p>
                  <p><span className="font-medium">Valor Unit:</span> R$ {item.valorUnitario?.toFixed(2) || 'N/A'}</p>
                  <p><span className="font-medium">Total:</span> R$ {item.total?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Nenhum item encontrado</p>
          )}
        </div>
      </div>

      {/* Totais */}
      <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">Totais</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <p><span className="font-medium text-orange-800">Subtotal:</span> R$ {data.totais?.subtotal?.toFixed(2) || 'N/A'}</p>
          <p><span className="font-medium text-orange-800">Descontos:</span> R$ {data.totais?.descontos?.toFixed(2) || 'N/A'}</p>
          <p><span className="font-medium text-orange-800">Impostos:</span> R$ {data.totais?.impostos?.toFixed(2) || 'N/A'}</p>
          <p><span className="font-medium text-orange-800">Total:</span> R$ {data.totais?.total?.toFixed(2) || 'N/A'}</p>
        </div>
      </div>

      {/* JSON Raw */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-100">Dados JSON (Raw)</h3>
          <button
            onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Copiar JSON
          </button>
        </div>
        <pre className="text-sm text-gray-300 overflow-auto max-h-64">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}
