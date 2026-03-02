import { useMemo, useState } from 'react'

function formatDayLabel(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export default function ForecastPage() {
  const [city, setCity] = useState('São Paulo')
  const [days, setDays] = useState(7)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resolvedDays = useMemo(() => {
    // Open-Meteo (endpoint gratuito) normalmente oferece até 16 dias de previsão.
    // Mantendo 7 como padrão; se o usuário pedir 30, a gente limita ao máximo suportado.
    const numericDays = Number(days)
    if (!Number.isFinite(numericDays)) return 7
    return Math.min(Math.max(Math.trunc(numericDays), 1), 16)
  }, [days])

  async function handleSearch(event) {
    event.preventDefault()

    const trimmedCity = city.trim()

    if (!trimmedCity) {
      setError('Digite o nome de uma cidade.')
      setForecast(null)
      return
    }

    const apiKey = (import.meta.env.VITE_OPENWEATHER_API_KEY || '').trim()

    if (!apiKey) {
      setError('Chave da API não encontrada. Crie a variável VITE_OPENWEATHER_API_KEY no arquivo .env.')
      setForecast(null)
      return
    }

    try {
      setLoading(true)
      setError('')

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${apiKey}&units=metric&lang=pt_br`
      const weatherResponse = await fetch(weatherUrl)
      const weatherData = await weatherResponse.json()

      if (Number(weatherData?.cod) !== 200) {
        if (Number(weatherData?.cod) === 404) {
          throw new Error('Cidade não encontrada.')
        }

        if (Number(weatherData?.cod) === 401) {
          throw new Error('API key inválida ou ainda não ativada. Aguarde alguns minutos e tente de novo.')
        }

        throw new Error(weatherData?.message || 'Erro ao buscar dados da cidade.')
      }

      const latitude = weatherData?.coord?.lat
      const longitude = weatherData?.coord?.lon

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Não foi possível localizar as coordenadas da cidade.')
      }

      const dailyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=${resolvedDays}`
      const dailyResponse = await fetch(dailyUrl)
      const dailyData = await dailyResponse.json()

      if (!dailyResponse.ok) {
        throw new Error('Erro ao buscar previsão diária.')
      }

      const time = dailyData?.daily?.time
      const tempMax = dailyData?.daily?.temperature_2m_max
      const tempMin = dailyData?.daily?.temperature_2m_min
      const rainMax = dailyData?.daily?.precipitation_probability_max

      if (!Array.isArray(time) || !Array.isArray(tempMax) || !Array.isArray(tempMin)) {
        throw new Error('Resposta inesperada da API de previsão.')
      }

      const items = time.map((date, index) => ({
        date,
        tempMax: Number.isFinite(Number(tempMax[index])) ? Math.round(Number(tempMax[index])) : null,
        tempMin: Number.isFinite(Number(tempMin[index])) ? Math.round(Number(tempMin[index])) : null,
        rainChanceMax: Array.isArray(rainMax) && Number.isFinite(Number(rainMax[index])) ? Math.round(Number(rainMax[index])) : null,
      }))

      setForecast({
        cityName: weatherData.name,
        country: weatherData.sys?.country,
        items,
      })
    } catch (requestError) {
      setForecast(null)
      setError(requestError.message || 'Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="weather-app">
      <h1>Previsão</h1>

      <form onSubmit={handleSearch} className="weather-form">
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite uma cidade"
        />

        <select value={days} onChange={(event) => setDays(event.target.value)} aria-label="Quantidade de dias">
          <option value={7}>Próximos 7 dias</option>
          <option value={16}>Próximos 16 dias</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {forecast && (
        <section className="forecast">
          <h2>
            {forecast.cityName}, {forecast.country}
          </h2>

          <ul className="forecast-list">
            {forecast.items.map((item) => (
              <li key={item.date} className="forecast-item">
                <span className="forecast-date">{formatDayLabel(item.date)}</span>
                <span className="forecast-temps">
                  <strong>{item.tempMax === null ? '--' : `${item.tempMax}°`}</strong>
                  <span className="forecast-sep">/</span>
                  <span>{item.tempMin === null ? '--' : `${item.tempMin}°`}</span>
                </span>
                <span className="forecast-rain">{item.rainChanceMax === null ? '--' : `${item.rainChanceMax}%`}</span>
              </li>
            ))}
          </ul>

          <p className="forecast-hint">
            A API usada nesta tela (Open‑Meteo) fornece previsão diária gratuita até 16 dias.
          </p>
        </section>
      )}
    </main>
  )
}
