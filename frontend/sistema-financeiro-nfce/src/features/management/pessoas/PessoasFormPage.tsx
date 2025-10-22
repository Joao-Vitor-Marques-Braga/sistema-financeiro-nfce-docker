import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000/api/extrator'

type PessoaPayload = {
  razao_social: string
  fantasia?: string | null
  cnpj_cpf: string
  tipo: 'FORNECEDOR' | 'CLIENTE' | 'FATURADO'
  status?: 'ATIVO' | 'INATIVO'
}

type Props = { tipo: PessoaPayload['tipo'] }

export default function PessoasFormPage({ tipo }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<PessoaPayload>({ razao_social: '', fantasia: '', cnpj_cpf: '', tipo, status: 'ATIVO' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      ;(async () => {
        const res = await fetch(`${API_BASE_URL}/pessoas/${id}/`)
        const data = await res.json()
        setForm({ razao_social: data.razao_social, fantasia: data.fantasia, cnpj_cpf: data.cnpj_cpf, tipo: data.tipo, status: data.status })
      })()
    }
  }, [id])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload: PessoaPayload = { ...form, tipo }
    if (!isEdit && !payload.status) payload.status = 'ATIVO'

    const res = await fetch(isEdit ? `${API_BASE_URL}/pessoas/${id}/` : `${API_BASE_URL}/pessoas/`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    setLoading(false)
    if (res.ok) {
      navigate(-1)
    } else {
      const err = await res.json()
      alert('Erro ao salvar: ' + JSON.stringify(err))
    }
  }

  const titulo = isEdit ? 'Editar' : 'Novo'

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{titulo} {tipo.toLowerCase()}</h1>
        <Link to={-1 as any} className="border px-3 py-2 rounded">Voltar</Link>
      </div>

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Razão Social</label>
          <input value={form.razao_social} onChange={e => setForm({ ...form, razao_social: e.target.value })} className="border rounded w-full px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Fantasia</label>
          <input value={form.fantasia || ''} onChange={e => setForm({ ...form, fantasia: e.target.value })} className="border rounded w-full px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Documento (CNPJ/CPF)</label>
          <input value={form.cnpj_cpf} onChange={e => setForm({ ...form, cnpj_cpf: e.target.value })} className="border rounded w-full px-3 py-2" required />
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
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
