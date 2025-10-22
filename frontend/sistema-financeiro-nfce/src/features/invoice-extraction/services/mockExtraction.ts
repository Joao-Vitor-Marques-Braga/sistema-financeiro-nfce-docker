import type { InvoiceData } from "../types"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const SAMPLE_INVOICE: InvoiceData = {
  numero: "12345",
  serie: "1",
  emissao: "2025-08-15",
  emitente: { nome: "Fornecedor Exemplo LTDA", cnpj: "12.345.678/0001-90" },
  destinatario: { nome: "Cliente Demo SA", cnpj: "98.765.432/0001-10" },
  itens: [
    { descricao: "Produto A", quantidade: 2, valorUnitario: 150.5, total: 301 },
    { descricao: "Produto B", quantidade: 1, valorUnitario: 99.9, total: 99.9 },
  ],
  totais: { subtotal: 400.9, descontos: 10.0, impostos: 62.5, total: 453.4 },
}

export async function mockExtractInvoice(_file: File): Promise<InvoiceData> {
  await delay(1200)
  return SAMPLE_INVOICE
}


