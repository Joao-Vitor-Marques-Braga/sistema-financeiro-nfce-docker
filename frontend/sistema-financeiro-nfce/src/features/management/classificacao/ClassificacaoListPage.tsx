import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000/api/extrator'

type Classificacao = {
  id: number
  descricao: string
  tipo: 'DESPESA' | 'RECEITA'
  status: 'ATIVO' | 'INATIVO'
}

type Props = { tipo: Classificacao['tipo'] }

export default function ClassificacaoListPage({ tipo }: Props) {
  const [dados, setDados] = useState<Classificacao[]>([])
  const [statusFilter, setStatusFilter] = useState<'ATIVO' | 'INATIVO' | ''>('')

  async function carregar() {
    const params = new URLSearchParams()
    params.set('tipo', tipo)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`${API_BASE_URL}/classificacoes/?${params.toString()}`)
    const json = await res.json()
    setDados(json.results || json)
  }

  useEffect(() => { carregar() }, [tipo, statusFilter])

  async function toggleStatus(id: number) {
    await fetch(`${API_BASE_URL}/classificacoes/${id}/toggle-status/`, { method: 'POST' })
    await carregar()
  }

  const titulo = tipo === 'DESPESA' ? 'Tipos de Despesa' : 'Tipos de Receita'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border rounded px-2 py-1 bg-white">
            <option value="">Todos</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
          </select>
          <Link to={tipo === 'DESPESA' ? '/despesas/novo' : '/receitas/novo'} className="btn-primary">Adicionar Novo</Link>
          <Link to="/" className="btn-secondary">Voltar</Link>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Descrição</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(d => (
              <tr key={d.id} className="border-t hover:bg-slate-50">
                <td className="p-2">{d.id}</td>
                <td className="p-2">{d.descricao}</td>
                <td className="p-2">{d.status}</td>
                <td className="p-2 flex gap-2">
                  <Link to={`${tipo === 'DESPESA' ? '/despesas' : '/receitas'}/${d.id}`} className="btn-secondary">Editar</Link>
                  <button onClick={() => toggleStatus(d.id)} className={`px-2 py-1 rounded ${d.status==='ATIVO'?'bg-yellow-500 text-white':'bg-green-600 text-white'}`}>
                    {d.status === 'ATIVO' ? 'Inativar' : 'Reativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
