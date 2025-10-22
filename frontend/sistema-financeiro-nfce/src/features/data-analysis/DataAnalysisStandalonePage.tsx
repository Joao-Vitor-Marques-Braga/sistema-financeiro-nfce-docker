import { useState, useEffect } from 'react'
import DataAnalysisPage from './DataAnalysisPage'
import type { InvoiceData } from '../invoice-extraction/types'

export default function DataAnalysisStandalonePage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Carregar dados do sessionStorage
    const loadDataFromStorage = () => {
      try {
        const savedData = sessionStorage.getItem('extracted_invoice_data')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          setInvoiceData(parsedData)
          console.log('📁 Dados carregados do sessionStorage para análise standalone:', parsedData)
        } else {
          setError('Nenhum dado de nota fiscal encontrado no sessionStorage')
          console.log('⚠️ Nenhum dado encontrado no sessionStorage')
        }
      } catch (error) {
        setError('Erro ao carregar dados do sessionStorage')
        console.error('❌ Erro ao carregar dados do sessionStorage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDataFromStorage()
  }, [])

  const handleBack = () => {
    // Voltar para a página de extração
    window.history.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Carregando dados...
          </h2>
          <p className="text-gray-600">
            Buscando dados da nota fiscal no sessionStorage
          </p>
        </div>
      </div>
    )
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dados não encontrados
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Nenhum dado de nota fiscal foi encontrado.'}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Certifique-se de que você extraiu dados de uma nota fiscal primeiro.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DataAnalysisPage 
      invoiceData={invoiceData} 
      onBack={handleBack} 
    />
  )
}
