export type InvoiceItem = {
  descricao: string
  quantidade: number
  valorUnitario: number
  total: number
}

export type Party = {
  nome: string
  cnpj: string
}

export type InvoiceTotals = {
  subtotal: number
  descontos: number
  impostos: number
  total: number
}

export type InvoiceData = {
  numero: string
  serie: string
  emissao: string
  emitente: Party
  destinatario: Party
  itens: InvoiceItem[]
  totais: InvoiceTotals
}


