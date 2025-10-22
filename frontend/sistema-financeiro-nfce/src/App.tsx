import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import InvoiceExtractionPage from './features/invoice-extraction/InvoiceExtractionPage'
import Dashboard from './features/management/Dashboard'
import PessoasListPage from './features/management/pessoas/PessoasListPage'
import PessoasFormPage from './features/management/pessoas/PessoasFormPage'
import ClassificacaoListPage from './features/management/classificacao/ClassificacaoListPage'
import ClassificacaoFormPage from './features/management/classificacao/ClassificacaoFormPage'
import Sidebar from './features/management/components/Sidebar'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/extrator" element={<InvoiceExtractionPage />} />

            {/* Pessoas */}
            <Route path="/fornecedores" element={<PessoasListPage tipo="FORNECEDOR" />} />
            <Route path="/fornecedores/novo" element={<PessoasFormPage tipo="FORNECEDOR" />} />
            <Route path="/fornecedores/:id" element={<PessoasFormPage tipo="FORNECEDOR" />} />

            <Route path="/clientes" element={<PessoasListPage tipo="CLIENTE" />} />
            <Route path="/clientes/novo" element={<PessoasFormPage tipo="CLIENTE" />} />
            <Route path="/clientes/:id" element={<PessoasFormPage tipo="CLIENTE" />} />

            <Route path="/faturados" element={<PessoasListPage tipo="FATURADO" />} />
            <Route path="/faturados/novo" element={<PessoasFormPage tipo="FATURADO" />} />
            <Route path="/faturados/:id" element={<PessoasFormPage tipo="FATURADO" />} />

            {/* Classificações */}
            <Route path="/despesas" element={<ClassificacaoListPage tipo="DESPESA" />} />
            <Route path="/despesas/novo" element={<ClassificacaoFormPage tipo="DESPESA" />} />
            <Route path="/despesas/:id" element={<ClassificacaoFormPage tipo="DESPESA" />} />

            <Route path="/receitas" element={<ClassificacaoListPage tipo="RECEITA" />} />
            <Route path="/receitas/novo" element={<ClassificacaoFormPage tipo="RECEITA" />} />
            <Route path="/receitas/:id" element={<ClassificacaoFormPage tipo="RECEITA" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
