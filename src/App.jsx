import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AboutPage from './pages/AboutPage.jsx'
import ForecastPage from './pages/ForecastPage.jsx'
import WeatherPage from './pages/WeatherPage.jsx'

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
        <Route path="/" element={<WeatherPage />} />
        <Route path="/previsao" element={<ForecastPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
