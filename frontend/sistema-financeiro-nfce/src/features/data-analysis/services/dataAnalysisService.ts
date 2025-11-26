import type { DataAnalysisResult, Fornecedor, Faturado, Despesa, MovementCreationResult } from '../types'
import type { InvoiceData } from '../../invoice-extraction/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://joaovitormb.pythonanywhere.com/api/extrator'

export class DataAnalysisService {
  // Consulta se o fornecedor existe no banco
  async checkFornecedor(cnpj: string): Promise<Fornecedor> {
    try {
      const response = await fetch(`${API_BASE_URL}/fornecedores/check/?cnpj=${cnpj}`)
      const data = await response.json()

      if (data.exists) {
        return {
          razaoSocial: data.razaoSocial,
          cnpj: cnpj,
          status: 'EXISTS',
          id: data.id
        }
      } else {
        return {
          razaoSocial: data.razaoSocial || '',
          cnpj: cnpj,
          status: 'NOT_EXISTS'
        }
      }
    } catch (error) {
      console.error('Erro ao consultar fornecedor:', error)
      throw new Error('Erro ao consultar fornecedor')
    }
  }

  // Consulta se o faturado existe no banco
  async checkFaturado(cpf: string): Promise<Faturado> {
    try {
      const response = await fetch(`${API_BASE_URL}/faturados/check/?cpf=${cpf}`)
      const data = await response.json()

      if (data.exists) {
        return {
          nome: data.nome,
          cpf: cpf,
          status: 'EXISTS',
          id: data.id
        }
      } else {
        return {
          nome: data.nome || '',
          cpf: cpf,
          status: 'NOT_EXISTS'
        }
      }
    } catch (error) {
      console.error('Erro ao consultar faturado:', error)
      throw new Error('Erro ao consultar faturado')
    }
  }

  // Consulta se a despesa existe no banco
  async checkDespesa(descricao: string): Promise<Despesa> {
    try {
      const response = await fetch(`${API_BASE_URL}/despesas/check/?descricao=${encodeURIComponent(descricao)}`)
      const data = await response.json()

      if (data.exists) {
        return {
          descricao: descricao,
          status: 'EXISTS',
          id: data.id
        }
      } else {
        return {
          descricao: descricao,
          status: 'NOT_EXISTS'
        }
      }
    } catch (error) {
      console.error('Erro ao consultar despesa:', error)
      throw new Error('Erro ao consultar despesa')
    }
  }

  // Cria um novo fornecedor
  async createFornecedor(razaoSocial: string, cnpj: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/fornecedores/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razaoSocial,
          cnpj,
          tipo: 'FORNECEDOR'
        }),
      })

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error)
      throw new Error('Erro ao criar fornecedor')
    }
  }

  // Cria um novo faturado
  async createFaturado(nome: string, cpf: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/faturados/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cpf,
          tipo: 'FATURADO'
        }),
      })

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Erro ao criar faturado:', error)
      throw new Error('Erro ao criar faturado')
    }
  }

  // Cria uma nova despesa
  async createDespesa(descricao: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/despesas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descricao,
          tipo: 'DESPESA'
        }),
      })

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Erro ao criar despesa:', error)
      throw new Error('Erro ao criar despesa')
    }
  }

  // Cria um novo movimento (conta a pagar)
  async createMovimento(movementData: {
    fornecedorId: number
    faturadoId: number
    despesaId: number
    valor: number
    dataVencimento: string
    observacoes?: string
  }): Promise<MovementCreationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/movimentos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...movementData,
          tipo: 'APAGAR'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data?.error || 'Erro ao lançar registro'
        }
      }

      return {
        success: true,
        message: data?.message || 'Registro lançado com sucesso!',
        movimentoId: data?.id
      }
    } catch (error) {
      console.error('Erro ao criar movimento:', error)
      return {
        success: false,
        message: 'Erro ao lançar registro'
      }
    }
  }

  // Analisa os dados da nota fiscal
  async analyzeInvoiceData(invoiceData: InvoiceData): Promise<DataAnalysisResult> {
    try {
      // Log para debug
      console.log('🔍 Analisando dados da nota fiscal:', invoiceData)

      // Verificação de segurança mais robusta
      if (!invoiceData) {
        throw new Error('Dados da nota fiscal não fornecidos')
      }

      // Log detalhado da estrutura dos dados
      console.log('📋 Estrutura dos dados recebidos:', {
        keys: Object.keys(invoiceData),
        fornecedor: (invoiceData as any).Fornecedor,
        faturado: (invoiceData as any).Faturado,
        emitente: (invoiceData as any).emitente,
        destinatario: (invoiceData as any).destinatario
      })

      // Tentar diferentes estruturas de dados
      let emitente: any = null
      let destinatario: any = null

      // Estrutura 1: Fornecedor/Faturado (dados reais extraídos)
      if ((invoiceData as any).Fornecedor) {
        emitente = (invoiceData as any).Fornecedor
        console.log('✅ Usando estrutura Fornecedor:', emitente)
      } else if (invoiceData.emitente) {
        emitente = invoiceData.emitente
        console.log('✅ Usando estrutura emitente:', emitente)
      }

      if ((invoiceData as any).Faturado) {
        destinatario = (invoiceData as any).Faturado
        console.log('✅ Usando estrutura Faturado:', destinatario)
      } else if (invoiceData.destinatario) {
        destinatario = invoiceData.destinatario
        console.log('✅ Usando estrutura destinatario:', destinatario)
      }

      // Verificar se encontrou os dados
      if (!emitente) {
        throw new Error('Dados do emitente/fornecedor não encontrados')
      }

      if (!destinatario) {
        throw new Error('Dados do destinatário/faturado não encontrados')
      }

      // Verificar se os campos essenciais existem (tentar diferentes nomes de campos)
      const emitenteNome = emitente.nome || emitente.Nome ||
        emitente.razaoSocial || emitente.RazaoSocial ||
        emitente['Razão Social'] || emitente['Razao Social'] || 'N/A'

      const emitenteCnpj = emitente.cnpj || emitente.CNPJ ||
        emitente.cpf || emitente.CPF || 'N/A'

      const destinatarioNome = destinatario.nome || destinatario.Nome ||
        destinatario.razaoSocial || destinatario.RazaoSocial ||
        destinatario['Nome Completo'] || destinatario['Nome Completo'] || 'N/A'

      const destinatarioCnpj = destinatario.cnpj || destinatario.CNPJ ||
        destinatario.cpf || destinatario.CPF || 'N/A'

      console.log('📊 Dados extraídos:', {
        emitenteNome,
        emitenteCnpj,
        destinatarioNome,
        destinatarioCnpj
      })

      // Log detalhado dos campos encontrados
      console.log('🔍 Campos do emitente encontrados:', Object.keys(emitente))
      console.log('🔍 Campos do destinatário encontrados:', Object.keys(destinatario))
      console.log('🔍 Emitente completo:', emitente)
      console.log('🔍 Destinatário completo:', destinatario)

      // Consultas reais no backend
      const descricaoDespesa = this.generateDespesaDescription(invoiceData)
      const [fornecedor, faturado, despesa] = await Promise.all([
        this.checkFornecedor(emitenteCnpj),
        this.checkFaturado(destinatarioCnpj),
        this.checkDespesa(descricaoDespesa)
      ])

      const result: DataAnalysisResult = {
        fornecedor: {
          razaoSocial: fornecedor.razaoSocial || emitenteNome,
          cnpj: emitenteCnpj,
          status: fornecedor.status,
          id: fornecedor.id
        },
        faturado: {
          nome: faturado.nome || destinatarioNome,
          cpf: destinatarioCnpj,
          status: faturado.status,
          id: faturado.id
        },
        despesa: {
          descricao: despesa.descricao || descricaoDespesa,
          status: despesa.status,
          id: despesa.id
        }
      }

      console.log('✅ Análise concluída:', result)
      return result
    } catch (error) {
      console.error('Erro na análise dos dados:', error)
      throw new Error('Erro na análise dos dados da nota fiscal')
    }
  }

  // Gera descrição da despesa baseada nos itens da nota
  private generateDespesaDescription(invoiceData: any): string {
    console.log('🔍 Gerando descrição da despesa para:', invoiceData)

    // Tentar diferentes estruturas para os itens
    let itens: any[] = []

    if (invoiceData.itens && Array.isArray(invoiceData.itens)) {
      itens = invoiceData.itens
      console.log('✅ Usando estrutura itens:', itens)
    } else if ((invoiceData as any)['Descrição dos produtos'] && Array.isArray((invoiceData as any)['Descrição dos produtos'])) {
      itens = (invoiceData as any)['Descrição dos produtos']
      console.log('✅ Usando estrutura "Descrição dos produtos":', itens)
    } else if ((invoiceData as any).produtos && Array.isArray((invoiceData as any).produtos)) {
      itens = (invoiceData as any).produtos
      console.log('✅ Usando estrutura produtos:', itens)
    }

    console.log('📋 Itens encontrados:', itens.length)

    if (itens.length === 0) {
      return 'COMPRAS GERAIS'
    }

    // Tentar extrair a descrição do primeiro item
    let primeiraDescricao = ''
    const primeiroItem = itens[0]

    if (typeof primeiroItem === 'string') {
      primeiraDescricao = primeiroItem
    } else if (primeiroItem.descricao) {
      primeiraDescricao = primeiroItem.descricao
    } else if (primeiroItem.Descricao) {
      primeiraDescricao = primeiroItem.Descricao
    } else if (primeiroItem.nome) {
      primeiraDescricao = primeiroItem.nome
    } else if (primeiroItem.Nome) {
      primeiraDescricao = primeiroItem.Nome
    }

    console.log('📝 Primeira descrição encontrada:', primeiraDescricao)

    if (!primeiraDescricao) {
      return 'COMPRAS GERAIS'
    }

    if (itens.length === 1) {
      return primeiraDescricao.toUpperCase()
    }

    // Se há múltiplos itens, categoriza por tipo comum
    const descricaoLower = primeiraDescricao.toLowerCase()

    if (descricaoLower.includes('manutenção') || descricaoLower.includes('manutencao')) {
      return 'MANUTENÇÃO E OPERAÇÃO'
    }

    if (descricaoLower.includes('material') || descricaoLower.includes('peça')) {
      return 'MATERIAIS E PEÇAS'
    }

    if (descricaoLower.includes('serviço') || descricaoLower.includes('servico')) {
      return 'SERVIÇOS GERAIS'
    }

    return 'COMPRAS GERAIS'
  }
}

export const dataAnalysisService = new DataAnalysisService()
