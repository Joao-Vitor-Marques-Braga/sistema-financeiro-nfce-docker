import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const base = 'block px-3 py-2 rounded hover:bg-gray-100'
  const active = 'bg-blue-600 text-white hover:bg-blue-700'

  return (
    <aside className="h-screen w-64 sticky top-0 bg-gradient-to-b from-blue-600 to-violet-600 text-white">
      <div className="p-4 border-b border-white/10">
        <NavLink to="/" className="font-semibold text-lg">Financeiro</NavLink>
      </div>
      <nav className="p-3 space-y-1 text-sm">
        <NavLink to="/" end className={({isActive}) => `${base} ${isActive ? active : ''}`}>Dashboard</NavLink>
        <NavLink to="/extrator" className={({isActive}) => `${base} ${isActive ? active : ''}`}>Extrator</NavLink>
        <div className="mt-3 px-2 text-xs uppercase text-white/60">Cadastros</div>
        <NavLink to="/fornecedores" className={({isActive}) => `${base} ${isActive ? active : 'text-white/90 hover:bg-white/10'}`}>Fornecedores</NavLink>
        <NavLink to="/clientes" className={({isActive}) => `${base} ${isActive ? active : 'text-white/90 hover:bg-white/10'}`}>Clientes</NavLink>
        <NavLink to="/faturados" className={({isActive}) => `${base} ${isActive ? active : 'text-white/90 hover:bg-white/10'}`}>Faturados</NavLink>
        <div className="mt-3 px-2 text-xs uppercase text-white/60">Classificações</div>
        <NavLink to="/despesas" className={({isActive}) => `${base} ${isActive ? active : 'text-white/90 hover:bg-white/10'}`}>Despesas</NavLink>
        <NavLink to="/receitas" className={({isActive}) => `${base} ${isActive ? active : 'text-white/90 hover:bg-white/10'}`}>Receitas</NavLink>
      </nav>
    </aside>
  )
}


