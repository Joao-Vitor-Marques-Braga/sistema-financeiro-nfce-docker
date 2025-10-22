import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000/api/extrator'

type Pessoa = {
  id: number
  razao_social: string
  fantasia?: string | null
  cnpj_cpf: string
  tipo: 'FORNECEDOR' | 'CLIENTE' | 'FATURADO'
  status: 'ATIVO' | 'INATIVO'
}

type Props = { tipo: Pessoa['tipo'] }

export default function PessoasListPage({ tipo }: Props) {
  const [dados, setDados] = useState<Pessoa[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ATIVO' | 'INATIVO' | ''>('')

  async function carregar() {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('tipo', tipo)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`${API_BASE_URL}/pessoas/?${params.toString()}`)
    const json = await res.json()
    setDados(json.results || json) // suporta paginado ou não
    setLoading(false)
  }

  useEffect(() => { carregar() }, [tipo, statusFilter])

  async function toggleStatus(id: number) {
    await fetch(`${API_BASE_URL}/pessoas/${id}/toggle-status/`, { method: 'POST' })
    await carregar()
  }

  const titulo = tipo === 'FORNECEDOR' ? 'Fornecedores' : tipo === 'CLIENTE' ? 'Clientes' : 'Faturados'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border rounded px-2 py-1 bg-white">
            <option value="">Todos</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
          </select>
          <Link to={`/${titulo.toLowerCase()}/novo`.replace('ç','c')} className="btn-primary">Adicionar Novo</Link>
          <Link to="/" className="btn-secondary">Voltar</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-600">Carregando...</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Razão Social</th>
                <th className="text-left p-2">Documento</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map(p => (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.razao_social}</td>
                  <td className="p-2">{p.cnpj_cpf}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2 flex gap-2">
                    <Link to={`/${titulo.toLowerCase()}/${p.id}`.replace('ç','c')} className="btn-secondary">Editar</Link>
                    <button onClick={() => toggleStatus(p.id)} className={`px-2 py-1 rounded ${p.status==='ATIVO'?'bg-yellow-500 text-white':'bg-green-600 text-white'}`}>
                      {p.status === 'ATIVO' ? 'Inativar' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
