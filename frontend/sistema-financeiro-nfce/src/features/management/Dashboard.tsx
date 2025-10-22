import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-start justify-center px-6 py-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo</h1>
        <p className="text-slate-600 mb-8">Escolha uma opção para começar</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link to="/extrator" className="block p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2">Extrator de Notas</h2>
            <p className="text-gray-600 text-sm">Enviar PDF e extrair dados</p>
          </Link>
          <Link to="/fornecedores" className="block p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2">Fornecedores</h2>
            <p className="text-gray-600 text-sm">Manter fornecedores</p>
          </Link>
          <Link to="/clientes" className="block p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2">Clientes</h2>
            <p className="text-gray-600 text-sm">Manter clientes</p>
          </Link>
          <Link to="/faturados" className="block p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2">Faturados</h2>
            <p className="text-gray-600 text-sm">Manter faturados</p>
          </Link>
          <Link to="/despesas" className="block p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2">Tipos de Despesa</h2>
            <p className="text-gray-600 text-sm">Manter classificações de despesa</p>
          </Link>
          <Link to="/receitas" className="block p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2">Tipos de Receita</h2>
            <p className="text-gray-600 text-sm">Manter classificações de receita</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
