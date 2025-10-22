import { useState } from 'react'
import type { DataAnalysisState } from '../types'
import type { InvoiceData } from '../../invoice-extraction/types'
import { dataAnalysisService } from '../services/dataAnalysisService'

export function useDataAnalysis() {
  const [state, setState] = useState<DataAnalysisState>({
    isAnalyzing: false,
    analysisResult: null,
    isCreatingMovement: false,
    creationResult: null,
    error: null
  })

  const analyzeData = async (invoiceData: InvoiceData) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }))
    
    try {
      console.log('🔄 Iniciando análise dos dados:', invoiceData)
      const result = await dataAnalysisService.analyzeInvoiceData(invoiceData)
      console.log('✅ Análise finalizada com sucesso:', result)
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        analysisResult: result 
      }))
    } catch (error) {
      console.error('❌ Erro na análise:', error)
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }

  const createMovement = async (invoiceData: InvoiceData) => {
    if (!state.analysisResult) {
      setState(prev => ({ ...prev, error: 'Nenhum resultado de análise disponível' }))
      return
    }

    setState(prev => ({ ...prev, isCreatingMovement: true, error: null }))

    try {
      let fornecedorId = state.analysisResult.fornecedor.id
      let faturadoId = state.analysisResult.faturado.id
      let despesaId = state.analysisResult.despesa.id

      // Criar de verdade se não existir
      if (!fornecedorId && state.analysisResult.fornecedor.status === 'NOT_EXISTS') {
        fornecedorId = await dataAnalysisService.createFornecedor(
          state.analysisResult.fornecedor.razaoSocial,
          state.analysisResult.fornecedor.cnpj
        )
      }

      if (!faturadoId && state.analysisResult.faturado.status === 'NOT_EXISTS') {
        faturadoId = await dataAnalysisService.createFaturado(
          state.analysisResult.faturado.nome,
          state.analysisResult.faturado.cpf
        )
      }

      if (!despesaId && state.analysisResult.despesa.status === 'NOT_EXISTS') {
        despesaId = await dataAnalysisService.createDespesa(
          state.analysisResult.despesa.descricao
        )
      }

      // Criar movimento
      const movementData = {
        fornecedorId: fornecedorId!,
        faturadoId: faturadoId!,
        despesaId: despesaId!,
        valor: invoiceData.totais?.total || 0,
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        observacoes: `Nota fiscal ${invoiceData.numero || 'N/A'} - Série ${invoiceData.serie || 'N/A'}`
      }

      const result = await dataAnalysisService.createMovimento(movementData)
      
      setState(prev => ({ 
        ...prev, 
        isCreatingMovement: false, 
        creationResult: result 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isCreatingMovement: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar movimento'
      }))
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const reset = () => {
    setState({
      isAnalyzing: false,
      analysisResult: null,
      isCreatingMovement: false,
      creationResult: null,
      error: null
    })
  }

  return {
    ...state,
    analyzeData,
    createMovement,
    clearError,
    reset
  }
}
