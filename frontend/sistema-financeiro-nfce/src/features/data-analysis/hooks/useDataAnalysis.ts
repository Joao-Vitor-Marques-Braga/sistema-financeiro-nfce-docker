import { useState } from 'react'
import type { DataAnalysisState } from '../types'
import type { InvoiceData } from '../../invoice-extraction/types'
import { dataAnalysisService } from '../services/dataAnalysisService'

function parseCurrencyValue(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined) {
    return null
  }

  if (typeof rawValue === 'number') {
    return Number.isFinite(rawValue) ? rawValue : null
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim()
    if (!trimmed) {
      return null
    }

    // Remove qualquer caractere que não seja número, ponto, vírgula ou sinal
    let sanitized = trimmed.replace(/[^0-9,.-]/g, '')

    if (!sanitized) {
      return null
    }

    // Se possuir tanto ',' quanto '.', assumimos que a vírgula é o separador decimal (formato brasileiro)
    const hasComma = sanitized.includes(',')
    const hasDot = sanitized.includes('.')

    if (hasComma && hasDot) {
      // Remove pontos usados como separador de milhar e converte a vírgula para ponto
      sanitized = sanitized.replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
    } else if (hasComma) {
      // Apenas vírgula: converte para ponto para o parseFloat entender
      sanitized = sanitized.replace(',', '.')
    }

    const parsed = Number.parseFloat(sanitized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function calculateInvoiceTotal(invoiceData: InvoiceData | Record<string, any>): number {
  const candidateValues: unknown[] = [
    (invoiceData as any)?.totais?.total,
    (invoiceData as any)?.totais?.Total,
    (invoiceData as any)?.totais?.valor,
    (invoiceData as any)?.totais?.Valor,
    (invoiceData as any)?.total,
    (invoiceData as any)?.Total,
    (invoiceData as any)?.valor_total,
    (invoiceData as any)?.valorTotal,
    (invoiceData as any)?.valor,
    (invoiceData as any)?.Valor,
    (invoiceData as any)?.['Valor Total'],
    (invoiceData as any)?.['VALOR TOTAL'],
    (invoiceData as any)?.['valor total']
  ]

  for (const value of candidateValues) {
    const parsed = parseCurrencyValue(value)
    if (parsed !== null && parsed > 0) {
      return parsed
    }
  }

  const itemCollections = [
    (invoiceData as any)?.itens,
    (invoiceData as any)?.Itens,
    (invoiceData as any)?.produtos,
    (invoiceData as any)?.Produtos,
    (invoiceData as any)?.['Descrição dos produtos']
  ].filter(Array.isArray)

  for (const items of itemCollections) {
    const total = items.reduce((acc: number, item: any) => {
      const candidates = [item?.total, item?.Total, item?.valorTotal, item?.valor, item?.Valor]
      for (const candidate of candidates) {
        const parsed = parseCurrencyValue(candidate)
        if (parsed !== null) {
          return acc + parsed
        }
      }
      return acc
    }, 0)

    if (total > 0) {
      return total
    }
  }

  return 0
}

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
      const valorTotalNota = calculateInvoiceTotal(invoiceData)
      const valorNormalizado = valorTotalNota > 0 ? Math.round(valorTotalNota * 100) / 100 : 0

      if (valorNormalizado <= 0) {
        console.warn('⚠️ Não foi possível determinar o valor total da nota. Enviando valor 0 para o backend.', {
          bruteValue: valorTotalNota,
          invoiceData
        })
      }

      const movementData = {
        fornecedorId: fornecedorId!,
        faturadoId: faturadoId!,
        despesaId: despesaId!,
        valor: valorNormalizado,
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
