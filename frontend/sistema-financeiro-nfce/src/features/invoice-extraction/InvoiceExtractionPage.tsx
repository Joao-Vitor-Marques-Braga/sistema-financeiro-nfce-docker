import { FileUpload } from "./components/FileUpload"
import { ResultTabs } from "./components/Tabs"
import { JsonBlock } from "./components/JsonBlock"
import { InvoiceDataDisplay } from "./components/InvoiceDataDisplay"
import { ErrorAlert } from "./components/ErrorAlert"
import { useInvoiceExtraction } from "./hooks/useInvoiceExtraction"
import { useState } from "react"
import DataAnalysisPage from "../data-analysis/DataAnalysisPage"

export default function InvoiceExtractionPage() {
  const {
    selectedFile,
    isProcessing,
    result,
    error,
    activeTab,
    setActiveTab,
    onFileChange,
    extract,
    clearError,
    clearData,
  } = useInvoiceExtraction()
  
  const [showDataAnalysis, setShowDataAnalysis] = useState(false)

  async function onExtractClick() {
    if (!selectedFile) {
      alert("Selecione um arquivo PDF antes de extrair.")
      return
    }
    try {
      await extract()
    } catch (e) {
      console.error('Erro na extração:', e)
    }
  }

  function handleAnalyzeData() {
    if (!result) {
      alert("Nenhum dado extraído disponível para análise.")
      return
    }
    setShowDataAnalysis(true)
  }

  function handleBackFromAnalysis() {
    setShowDataAnalysis(false)
  }

  // Se estiver mostrando a análise de dados, renderiza a página de análise
  if (showDataAnalysis) {
    return (
      <DataAnalysisPage 
        invoiceData={result || undefined} 
        onBack={handleBackFromAnalysis} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Extração de Dados de Nota Fiscal</h1>
          <p className="text-gray-600 mt-2">Carregue um PDF de nota fiscal e extraia os dados automaticamente usando IA</p>
        </header>

        <section aria-labelledby="upload-section">
          <h2 id="upload-section" className="text-lg font-semibold text-gray-800 mb-3">Upload do PDF</h2>
          <FileUpload
            onChange={onFileChange}
            fileName={selectedFile ? selectedFile.name : null}
          />
          
          {error && (
            <ErrorAlert message={error} onClose={clearError} />
          )}
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onExtractClick}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              {isProcessing ? "Processando..." : "EXTRAIR DADOS"}
            </button>
            
            {result && (
              <button
                type="button"
                onClick={handleAnalyzeData}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
              >
                ANALISAR DADOS
              </button>
            )}
          </div>
        </section>

        {result && (
          <section aria-labelledby="resultados" className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 id="resultados" className="text-lg font-semibold text-gray-800">Dados Extraídos (JSON)</h2>
              <button
                type="button"
                onClick={clearData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpar Dados
              </button>
            </div>
            <div className="mt-4">
              <JsonBlock json={result} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}


