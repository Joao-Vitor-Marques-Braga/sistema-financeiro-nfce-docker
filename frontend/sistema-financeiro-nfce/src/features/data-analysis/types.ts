export type EntityStatus = 'EXISTS' | 'NOT_EXISTS'

export type Fornecedor = {
  razaoSocial: string
  cnpj: string
  status: EntityStatus
  id?: number
}

export type Faturado = {
  nome: string
  cpf: string
  status: EntityStatus
  id?: number
}

export type Despesa = {
  descricao: string
  status: EntityStatus
  id?: number
}

export type DataAnalysisResult = {
  fornecedor: Fornecedor
  faturado: Faturado
  despesa: Despesa
}

export type MovementCreationResult = {
  success: boolean
  message: string
  movimentoId?: number
}

export type DataAnalysisState = {
  isAnalyzing: boolean
  analysisResult: DataAnalysisResult | null
  isCreatingMovement: boolean
  creationResult: MovementCreationResult | null
  error: string | null
}
