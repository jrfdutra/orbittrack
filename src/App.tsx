import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import RotaProtegida from '@/components/RotaProtegida'
import LayoutPainel from '@/components/painel/LayoutPainel'
import Login from '@/pages/Login'
import Registar from '@/pages/Registar'
import RecuperarSenha from '@/pages/RecuperarSenha'
import RedefinirSenha from '@/pages/RedefinirSenha'

// Páginas temporárias do painel e público que vamos expandir nas fases seguintes
import Dashboard from '@/pages/painel/Dashboard'
import EncomendasLista from '@/pages/painel/EncomendasLista'
import EncomendaForm from '@/pages/painel/EncomendaForm'
import EmpresaPerfil from '@/pages/painel/EmpresaPerfil'
import EstadosConfig from '@/pages/painel/EstadosConfig'
import AcompanharEncomenda from '@/pages/publico/AcompanharEncomenda'
import PecaPassaporte from '@/pages/publico/PecaPassaporte'
import VerificarCertificado from '@/pages/publico/VerificarCertificado'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registar" element={<Registar />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/painel/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/acompanhar/:token" element={<AcompanharEncomenda />} />
          <Route path="/peca/:tokenPeca" element={<PecaPassaporte />} />
          <Route path="/verificar/:codigo" element={<VerificarCertificado />} />
          <Route path="/verificar" element={<VerificarCertificado />} />

          {/* Rotas Protegidas do Painel */}
          <Route
            path="/painel"
            element={
              <RotaProtegida>
                <LayoutPainel />
              </RotaProtegida>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="encomendas" element={<EncomendasLista />} />
            <Route path="encomendas/nova" element={<EncomendaForm />} />
            <Route path="encomendas/:id/editar" element={<EncomendaForm />} />
            <Route path="empresa" element={<EmpresaPerfil />} />
            <Route path="estados" element={<EstadosConfig />} />
          </Route>

          {/* Redirecionamentos */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
