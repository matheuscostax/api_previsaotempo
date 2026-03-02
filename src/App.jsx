import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

// Pages (telas) do app:
// - TelaClima: tela principal (Home) para consultar o clima atual e chance de chuva por hora.
// - PrevProximosDias: tela de previsão diária (ex.: próximos 7/16 dias) para a cidade pesquisada.
// - TelaSobre: tela informativa explicando o projeto, APIs usadas e rotas.
import TelaSobre from './pages/AboutPage.jsx'
import PrevProximosDias from './pages/ForecastPage.jsx'
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
        {/* / = Home (consulta de clima) */}
        <Route path="/" element={<TelaClima />} />

        {/* /previsao = Previsão diária */}
        <Route path="/previsao" element={<PrevProximosDias />} />

        {/* /sobre = Informações do projeto */}
        <Route path="/sobre" element={<TelaSobre />} />

        {/* Qualquer rota desconhecida volta para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
