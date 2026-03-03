import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

// Pages (telas) do app:
// - TelaSobre: tela informativa explicando o projeto, APIs usadas e rotas.
import TelaSobre from './pages/AboutPage.jsx'
// - PrevProximosDias: tela de previsão dos próximos dias da cidade.
import PrevProximosDias from './pages/ForecastPage.jsx'
// - TelaClima padrão do app
import TelaClima from './pages/WeatherPage.jsx'

export default function App() {
  const getNavLinkClassName = ({ isActive }) =>
    isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'

  return (
    <>
      <nav className="app-nav" aria-label="Navegação">
        <NavLink to="/" end className={getNavLinkClassName}>
          Clima
        </NavLink>
        <NavLink to="/previsao" className={getNavLinkClassName}>
          Previsão
        </NavLink>
        <NavLink to="/sobre" className={getNavLinkClassName}>
          Sobre
        </NavLink>
      </nav>

      <Routes>
        
        {/* Tela padrão do sistema */}
        <Route path="/" element={<TelaClima />} />

        {/* Rota tela previsão dos próximos dias */}
        <Route path="/previsao" element={<PrevProximosDias />} />

        {/* Informações do sistema */}
        <Route path="/sobre" element={<TelaSobre />} />

        {/* Qualquer rota desconhecida volta para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
