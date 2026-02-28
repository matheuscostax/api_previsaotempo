import { useState } from 'react'
import './App.css'



//Calcula data e hora atuais da cidade, considerando o fuso horário retornado pela API do OpenWeather (em segundos)

function getCityDateParts(unixSeconds, timezoneOffsetSeconds) {
  const cityDate = new Date((unixSeconds + timezoneOffsetSeconds) * 1000)

  return {
    date: `${cityDate.getUTCFullYear()}-${String(cityDate.getUTCMonth() + 1).padStart(2, '0')}-${String(cityDate.getUTCDate()).padStart(2, '0')}`,
    hour: cityDate.getUTCHours(),
  }
}

//Define tema visual com base na condição climática principal e na chance de chuva nas próximas horas
function getWeatherTheme(weatherMain, maxRainChance) {
  const condition = String(weatherMain || '').toLowerCase()

    if (maxRainChance >= 50 || ['rain', 'drizzle', 'thunderstorm'].includes(condition)) {
    return 'rainy'
  }

if (['clouds', 'mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'ash', 'squall', 'tornado'].includes(condition)) {
    return 'cloudy'
  }

  return 'sunny'
}

function App() {
  const [city, setCity] = useState('São Paulo')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    const trimmedCity = city.trim()

      if (!trimmedCity) {
        setError('Digite o nome de uma cidade.')
        setWeather(null)
        return
      }
//pega a chave da api no arquivo .env
    const apiKey = (import.meta.env.VITE_OPENWEATHER_API_KEY || '').trim()
    console.log('OpenWeather key loaded:', apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'undefined/empty')

    if (!apiKey) {
      setError('Chave da API não encontrada. Crie a variável VITE_OPENWEATHER_API_KEY no arquivo .env.')
      setWeather(null)
      return
    }


    //procura a cidade na API do OpenWeather e, se encontrada, busca a previsão de chuva por hora na API do Open-Meteo. Trata erros de forma amigável para o usuário. 
    // Exibe os dados climáticos e a chance de chuva nas próximas horas. 
    // O tema visual do card muda conforme as condições climáticas e a chance de chuva.
    try {
      setLoading(true)
      setError('')

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${apiKey}&units=metric&lang=pt_br`

      const response = await fetch(url)
      const data = await response.json()

      if (Number(data?.cod) !== 200) {
        if (Number(data?.cod) === 404) {
          throw new Error('Cidade não encontrada.')
        }

        if (Number(data?.cod) === 401) {
          throw new Error('API key inválida ou ainda não ativada. Aguarde alguns minutos e tente de novo.')
        }

        throw new Error(data?.message || 'Erro ao buscar dados do clima.')
      }

      if (!response.ok) {
        throw new Error('Erro HTTP ao buscar dados do clima.')
      }

      let hourlyRain = []
// Busca a previsão de chuva por hora para o dia atual na cidade, usando a API do Open-Meteo.
      try {
        const nowInSeconds = Math.floor(Date.now() / 1000)
        const todayInCity = getCityDateParts(nowInSeconds, data.timezone)

        const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${data.coord.lat}&longitude=${data.coord.lon}&hourly=precipitation_probability&timezone=auto&start_date=${todayInCity.date}&end_date=${todayInCity.date}`
        const hourlyResponse = await fetch(hourlyUrl)
        const hourlyData = await hourlyResponse.json()

        if (hourlyResponse.ok && Array.isArray(hourlyData?.hourly?.time) && Array.isArray(hourlyData?.hourly?.precipitation_probability)) {
          const rainByHour = new Map(
            hourlyData.hourly.time.map((dateTime, index) => {
              const hour = Number((dateTime.split('T')[1] || '00:00').slice(0, 2))
              const chance = Number(hourlyData.hourly.precipitation_probability[index])
              return [hour, Number.isFinite(chance) ? Math.round(chance) : null]
            }),
          )

          hourlyRain = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            chance: rainByHour.has(hour) ? rainByHour.get(hour) : null,
          }))
        }
      } catch {
        hourlyRain = []
      }

      setWeather({ ...data, hourlyRain })
    } catch (requestError) {
      setWeather(null)
      setError(requestError.message || 'Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }
 //Calcula a hora atual na cidade e filtra as horas restantes do dia para exibir a chance de chuva apenas para o período futuro. 
  const cityNowHour = weather ? getCityDateParts(Math.floor(Date.now() / 1000), weather.timezone).hour : null
  const remainingHours = Array.isArray(weather?.hourlyRain)
    ? weather.hourlyRain.filter((item) => item.hour >= cityNowHour)
    : []
  const maxRainChance = remainingHours.reduce((max, item) => (item.chance !== null && item.chance > max ? item.chance : max), 0)
  const weatherMain = weather?.weather?.[0]?.main
  const weatherTheme = getWeatherTheme(weatherMain, maxRainChance)

  return (
    <main className="weather-app">
    <h1>Consulta de Clima</h1>

      <form onSubmit={handleSearch} className="weather-form">
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite uma cidade"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {weather && (
        <section className={`weather-card weather-card--${weatherTheme}`}>
           <div className="weather-visual" aria-hidden="true">
            {weatherTheme === 'sunny' && <div className="sun-icon" />}

            {(weatherTheme === 'cloudy' || weatherTheme === 'rainy') && (
              <div className="cloud-icon">
                <span />
                <span />
                <span />
              </div>
            )}

            {weatherTheme === 'rainy' && (
              <div className="rain-drops">
                {Array.from({ length: 12 }, (_, index) => (
                  <i key={index} style={{ '--delay': `${index * 0.18}s`, '--left': `${8 + index * 7}%` }} />
                ))}
              </div>
            )}
          </div>

          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="temp">{Math.round(weather.main.temp)}°C</p>
          <p>{weather.weather[0].description}</p>
          <div className="details">
            <span>Sensação: {Math.round(weather.main.feels_like)}°C</span>
            <span>Umidade: {weather.main.humidity}%</span>
            <span>Vento: {Math.round(weather.wind.speed * 3.6)} km/h</span>
          </div>

          {remainingHours.length > 0 && (
            <div className="hourly-rain">
              <h3>Chance de chuva por Hora </h3>
              <ul className="hourly-rain-list">
                {remainingHours.map((item) => (
                  <li key={item.hour} className={item.chance >= 50 ? 'high-chance' : ''}>
                    <span>{String(item.hour).padStart(2, '0')}:00</span>
                    <strong>{item.chance === null ? '--' : `${item.chance}%`}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
