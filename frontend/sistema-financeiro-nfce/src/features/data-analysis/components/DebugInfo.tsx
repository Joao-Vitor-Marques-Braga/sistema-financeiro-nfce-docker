import type { InvoiceData } from '../../invoice-extraction/types'

interface Props {
  data: InvoiceData
}

export function DebugInfo({ data }: Props) {
  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">🐛 Debug Info</h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <p><strong>Dados completos:</strong> {data ? '✅' : '❌'}</p>
        <p><strong>Emitente:</strong> {data?.emitente ? '✅' : '❌'}</p>
        <p><strong>Emitente nome:</strong> {data?.emitente?.nome || 'N/A'}</p>
        <p><strong>Emitente CNPJ:</strong> {data?.emitente?.cnpj || 'N/A'}</p>
        <p><strong>Destinatário:</strong> {data?.destinatario ? '✅' : '❌'}</p>
        <p><strong>Destinatário nome:</strong> {data?.destinatario?.nome || 'N/A'}</p>
        <p><strong>Destinatário CNPJ:</strong> {data?.destinatario?.cnpj || 'N/A'}</p>
        <p><strong>Itens:</strong> {data?.itens?.length || 0} itens</p>
        <p><strong>Totais:</strong> {data?.totais ? '✅' : '❌'}</p>
      </div>
    </div>
  )
}
