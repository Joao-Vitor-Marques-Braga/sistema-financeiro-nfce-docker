import { useState, useEffect } from "react"
import type { InvoiceData } from "../types"
import { ApiService } from "../services/apiService"

export type ActiveTab = "formatted" | "json"

const SESSION_STORAGE_KEY = 'extracted_invoice_data'

export function useInvoiceExtraction() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<InvoiceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>("formatted")

  // Carregar dados do sessionStorage quando o componente montar
  useEffect(() => {
    const savedData = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setResult(parsedData)
        console.log('📁 Dados carregados do sessionStorage:', parsedData)
      } catch (error) {
        console.error('❌ Erro ao carregar dados do sessionStorage:', error)
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }
  }, [])

  function onFileChange(file: File | null) {
    setSelectedFile(file)
    setError(null)
    setResult(null)
    
    // Limpar dados do sessionStorage quando um novo arquivo for selecionado
    if (file) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      console.log('🗑️ Dados anteriores removidos do sessionStorage')
    }
  }

  function clearError() {
    setError(null)
  }

  function clearData() {
    setResult(null)
    setError(null)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    console.log('🗑️ Todos os dados foram limpos')
  }

  async function extract() {
    if (!selectedFile) {
      throw new Error("Nenhum arquivo selecionado")
    }
    setIsProcessing(true)
    setError(null)
    try {
      const data = await ApiService.extractInvoiceData(selectedFile)
      setResult(data)
      
      // Salvar dados no sessionStorage
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
      console.log('💾 Dados salvos no sessionStorage:', data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
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
  }
}


