import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkBase = 'px-3 py-2 rounded hover:bg-gray-100'
  const active = 'bg-blue-600 text-white hover:bg-blue-700'
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between">
          <NavLink to="/" className="font-semibold text-lg">Financeiro</NavLink>
          <div className="flex gap-2 text-sm">
            <NavLink to="/" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Dashboard</NavLink>
            <NavLink to="/extrator" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Extrator</NavLink>
            <NavLink to="/fornecedores" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Fornecedores</NavLink>
            <NavLink to="/clientes" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Clientes</NavLink>
            <NavLink to="/faturados" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Faturados</NavLink>
            <NavLink to="/despesas" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Despesas</NavLink>
            <NavLink to="/receitas" className={({isActive}) => `${linkBase} ${isActive ? active : ''}`}>Receitas</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}


