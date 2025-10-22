import type { InvoiceData } from "../types"
import { mockExtractInvoice } from "./mockExtraction"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/extrator'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export class ApiService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  static async extractInvoiceData(file: File): Promise<InvoiceData> {
    const formData = new FormData()
    formData.append('pdf_file', file)

    try {
      console.log('Tentando extrair dados reais do PDF...')
      const response = await fetch(`${API_BASE_URL}/extract/`, {
        method: 'POST',
        body: formData,
      })

      const data = await this.handleResponse<InvoiceData>(response)
      console.log('✅ Dados extraídos com sucesso do PDF:', data)
      return data
    } catch (error) {
      console.warn('⚠️ API não disponível, usando dados mockados:', error)
      console.log('📄 Usando dados mockados para demonstração...')
      return await mockExtractInvoice(file)
    }
  }
}
