import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000/api/extrator'

type ClassificacaoPayload = {
  descricao: string
  tipo: 'DESPESA' | 'RECEITA'
  status?: 'ATIVO' | 'INATIVO'
}

type Props = { tipo: ClassificacaoPayload['tipo'] }

export default function ClassificacaoFormPage({ tipo }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<ClassificacaoPayload>({ descricao: '', tipo, status: 'ATIVO' })

  useEffect(() => {
    if (isEdit) {
      ;(async () => {
        const res = await fetch(`${API_BASE_URL}/classificacoes/${id}/`)
        const data = await res.json()
        setForm({ descricao: data.descricao, tipo: data.tipo, status: data.status })
      })()
    }
  }, [id])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const payload: ClassificacaoPayload = { ...form, tipo }
    if (!isEdit && !payload.status) payload.status = 'ATIVO'

    const res = await fetch(isEdit ? `${API_BASE_URL}/classificacoes/${id}/` : `${API_BASE_URL}/classificacoes/`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) navigate(-1)
    else {
      const err = await res.json()
      alert('Erro ao salvar: ' + JSON.stringify(err))
    }
  }

  const titulo = isEdit ? 'Editar' : 'Novo'

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{titulo} {tipo === 'DESPESA' ? 'Tipo de Despesa' : 'Tipo de Receita'}</h1>
        <Link to={-1 as any} className="border px-3 py-2 rounded">Voltar</Link>
      </div>

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="border rounded w-full px-3 py-2" required />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="border rounded w-full px-3 py-2">
              <option value="ATIVO">ATIVO</option>
              <option value="INATIVO">INATIVO</option>
            </select>
          </div>
        )}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
      </form>
    </div>
  )
}
