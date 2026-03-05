import { useState } from 'react'

// Calcula data e hora atuais da cidade, considerando o fuso horário retornado pela API do OpenWeather (em segundos)
function obterPartesDataCidade(unixSeconds, timezoneOffsetSeconds) {
  const cityDate = new Date((unixSeconds + timezoneOffsetSeconds) * 1000)

  return {
    date: `${cityDate.getUTCFullYear()}-${String(cityDate.getUTCMonth() + 1).padStart(2, '0')}-${String(cityDate.getUTCDate()).padStart(2, '0')}`,
    hour: cityDate.getUTCHours(),
  }
}
// Define tema visual com base na condição climática principal e na chance de chuva nas próximas horas do dia em questão, priorizando condições de chuva.
function obterTemaClima(condicaoPrincipal, chanceMaxChuva) {
  const condition = String(condicaoPrincipal || '').toLowerCase()

  if (chanceMaxChuva >= 50 || ['rain', 'drizzle', 'thunderstorm'].includes(condition)) {
    return 'rainy'
  }

  if (
    ['clouds', 'mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'ash', 'squall', 'tornado'].includes(condition)
  ) {
    return 'cloudy'
  }

  return 'sunny'
}

export default function TelaClima() {
  const [cidade, setCidade] = useState('')
  const [clima, setClima] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

//Função assíncrona que valida entrada, busca dados via OpenWeather e previsão horária via Open-Meteo.
  async function buscarClima(event) {
    event.preventDefault()

    const nomeCidade = cidade.trim()

    if (!nomeCidade) {
      setErro('Digite o nome de uma cidade.')
      setClima(null)
      return
    }

    // Busca a chave da api no arquivo .env
    const apiKey = (import.meta.env.VITE_OPENWEATHER_API_KEY || '').trim()

    if (!apiKey) {
      setErro('Chave da API não encontrada. Crie a variável VITE_OPENWEATHER_API_KEY no arquivo .env.')
      setClima(null)
      return
    }

    // Procura a cidade na API do OpenWeather e, se encontrada, busca a previsão de chuva por hora na API do Open-Meteo.
    try {
      setCarregando(true)
      setErro('')

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${apiKey}&units=metric&lang=pt_br`

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
        const hojeNaCidade = obterPartesDataCidade(nowInSeconds, data.timezone)

        const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${data.coord.lat}&longitude=${data.coord.lon}&hourly=precipitation_probability&timezone=auto&start_date=${hojeNaCidade.date}&end_date=${hojeNaCidade.date}`
        const hourlyResponse = await fetch(hourlyUrl)
        const hourlyData = await hourlyResponse.json()

        if (
          hourlyResponse.ok &&
          Array.isArray(hourlyData?.hourly?.time) &&
          Array.isArray(hourlyData?.hourly?.precipitation_probability)
        ) {
          const chuvaPorHora = new Map(
            hourlyData.hourly.time.map((dateTime, index) => {
              const hour = Number((dateTime.split('T')[1] || '00:00').slice(0, 2))
              const chance = Number(hourlyData.hourly.precipitation_probability[index])
              return [hour, Number.isFinite(chance) ? Math.round(chance) : null]
            }),
          )

          hourlyRain = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            chance: chuvaPorHora.has(hour) ? chuvaPorHora.get(hour) : null,
          }))
        }
      } catch {
        hourlyRain = []
      }

      setClima({ ...data, hourlyRain })
    } catch (requestError) {
      setClima(null)
      setErro(requestError.message || 'Ocorreu um erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }

  // Calcula a hora atual na cidade e filtra as horas restantes do dia para exibir a chance de chuva apenas para o período futuro.
  const horaAtualCidade = clima ? obterPartesDataCidade(Math.floor(Date.now() / 1000), clima.timezone).hour : null
  const horasRestantes = Array.isArray(clima?.hourlyRain) ? clima.hourlyRain.filter((item) => item.hour >= horaAtualCidade) : []
  const chanceMaxChuva = horasRestantes.reduce(
    (max, item) => (item.chance !== null && item.chance > max ? item.chance : max),
    0,
  )
  const condicaoPrincipal = clima?.weather?.[0]?.main
  const temaClima = obterTemaClima(condicaoPrincipal, chanceMaxChuva)

  return (
    <main className="weather-app">
      <h1>Consulta de Clima</h1>

      <form onSubmit={buscarClima} className="weather-form">
        <input
          type="text"
          value={cidade}
          onChange={(event) => setCidade(event.target.value)}
          placeholder="Digite uma cidade"
        />
        <button type="submit" disabled={carregando}>
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {erro && <p className="error">{erro}</p>}

      {clima && (
        <section className={`weather-card weather-card--${temaClima}`}>
          <div className="weather-visual" aria-hidden="true">
            {temaClima === 'sunny' && <div className="sun-icon" />}

            {(temaClima === 'cloudy' || temaClima === 'rainy') && (
              <div className="cloud-icon">
                <span />
                <span />
                <span />
              </div>
            )}

            {temaClima === 'rainy' && (
              <div className="rain-drops">
                {Array.from({ length: 12 }, (_, index) => (
                  <i key={index} style={{ '--delay': `${index * 0.18}s`, '--left': `${8 + index * 7}%` }} />
                ))}
              </div>
            )}
          </div>

          <h2>
            {clima.name}, {clima.sys.country}
          </h2>
          <p className="temp">{Math.round(clima.main.temp)}°C</p>
          <p>{clima.weather[0].description}</p>
          <div className="details">
            <span>Sensação: {Math.round(clima.main.feels_like)}°C</span>
            <span>Umidade: {clima.main.humidity}%</span>
            <span>Vento: {Math.round(clima.wind.speed * 3.6)} km/h</span>
          </div>

          {horasRestantes.length > 0 && (
            <div className="hourly-rain">
              <h3>Chance de chuva por Hora </h3>
              <ul className="hourly-rain-list">
                {horasRestantes.map((item) => (
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
