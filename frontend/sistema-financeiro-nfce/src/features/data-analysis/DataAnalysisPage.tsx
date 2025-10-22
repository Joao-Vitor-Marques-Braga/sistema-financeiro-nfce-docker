import { AnalysisResult } from './components/AnalysisResult'
import { ActionButtons } from './components/ActionButtons'
import { SuccessAlert } from './components/SuccessAlert'
import { ErrorAlert } from './components/ErrorAlert'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useDataAnalysis } from './hooks/useDataAnalysis'
import type { InvoiceData } from '../invoice-extraction/types'
import { useState, useEffect } from 'react'

interface DataAnalysisPageProps {
  invoiceData?: InvoiceData
  onBack: () => void
}

export default function DataAnalysisPage({ invoiceData: propInvoiceData, onBack }: DataAnalysisPageProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(propInvoiceData || null)

  // Carregar dados do sessionStorage se não foram passados como prop
  useEffect(() => {
    if (!invoiceData) {
      const savedData = sessionStorage.getItem('extracted_invoice_data')
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setInvoiceData(parsedData)
          console.log('📁 Dados carregados do sessionStorage para análise:', parsedData)
        } catch (error) {
          console.error('❌ Erro ao carregar dados do sessionStorage:', error)
        }
      }
    }
  }, [invoiceData])
  const {
    isAnalyzing,
    analysisResult,
    isCreatingMovement,
    creationResult,
    error,
    analyzeData,
    createMovement,
    clearError,
    reset
  } = useDataAnalysis()

  // Verificação de segurança
  if (!invoiceData) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dados da Nota Fiscal não encontrados
            </h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados da nota fiscal.
            </p>
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voltar
            </button>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  const handleAnalyze = async () => {
    await analyzeData(invoiceData)
  }

  const handleCreateMovement = async () => {
    await createMovement(invoiceData)
  }

  const handleBack = () => {
    reset()
    onBack()
  }

  const handleCloseSuccess = () => {
    reset()
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 md:p-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Análise de Dados da Nota Fiscal</h1>
              <p className="text-gray-600 mt-2">
                Analisando dados da nota {invoiceData.numero} - Série {invoiceData.serie}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </button>
          </div>
        </header>

        {/* Seções informativas removidas para mostrar apenas o resultado da análise */}

        {/* Alertas */}
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onClose={clearError} />
          </div>
        )}

        {creationResult?.success && (
          <div className="mb-6">
            <SuccessAlert message={creationResult.message} onClose={handleCloseSuccess} />
          </div>
        )}

        {/* Botões de Ação */}
        <section className="mb-6">
          <ActionButtons
            onAnalyze={handleAnalyze}
            onCreateMovement={handleCreateMovement}
            isAnalyzing={isAnalyzing}
            isCreatingMovement={isCreatingMovement}
            hasAnalysisResult={!!analysisResult}
          />
        </section>

        {/* Resultado da Análise */}
        {analysisResult && (
          <section>
            <AnalysisResult result={analysisResult} />
          </section>
        )}

        {/* Seção de processo removida */}
      </div>
    </div>
    </ErrorBoundary>
  )
}
