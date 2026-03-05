import { useMemo, useState } from 'react'

function formatarDia(isoDate) {
  const data = new Date(`${isoDate}T00:00:00`)
  return data.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export default function PrevProximosDias() {
  const [cidade, setCidade] = useState('')
  const [dias, setDias] = useState(7)
  const [previsao, setPrevisao] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

// Calcula e valida o número de dias para a previsão, garantindo limites.
  const diasResolvidos = useMemo(() => {
    const diasNumericos = Number(dias)
    if (!Number.isFinite(diasNumericos)) return 7
    return Math.min(Math.max(Math.trunc(diasNumericos), 1), 16)
  }, [dias])
// Procura a previsão na API usando os dados da cidade e faz a validação das entradas, além de buscar as coordenadas da API.
  async function buscarPrevisao(event) {
    event.preventDefault()
    const nomeCidade = cidade.trim()

    if (!nomeCidade) {
      setErro('Digite o nome de uma cidade.')
      setPrevisao(null)
      return
    }
    const apiKey = (import.meta.env.VITE_OPENWEATHER_API_KEY || '').trim()
    if (!apiKey) {
      setErro('Chave da API não encontrada. Crie a variável VITE_OPENWEATHER_API_KEY no arquivo .env.')
      setPrevisao(null)
      return
    }

    try {
      setCarregando(true)
      setErro('')

      const urlClimaCidade = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${apiKey}&units=metric&lang=pt_br`
      const respostaClimaCidade = await fetch(urlClimaCidade)
      const dadosClimaCidade = await respostaClimaCidade.json()

      if (Number(dadosClimaCidade?.cod) !== 200) {
        if (Number(dadosClimaCidade?.cod) === 404) {
          throw new Error('Cidade não encontrada.')
        }

        if (Number(dadosClimaCidade?.cod) === 401) {
          throw new Error('API key inválida ou ainda não ativada. Aguarde alguns minutos e tente de novo.')
        }

        throw new Error(dadosClimaCidade?.message || 'Erro ao buscar dados da cidade.')
      }

      const latitude = dadosClimaCidade?.coord?.lat
      const longitude = dadosClimaCidade?.coord?.lon

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Não foi possível localizar as coordenadas da cidade.')
      }

      const urlPrevisaoDiaria = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=${diasResolvidos}`
      const respostaPrevisaoDiaria = await fetch(urlPrevisaoDiaria)
      const dadosPrevisaoDiaria = await respostaPrevisaoDiaria.json()

      if (!respostaPrevisaoDiaria.ok) {
        throw new Error('Erro ao buscar previsão diária.')
      }

      const datas = dadosPrevisaoDiaria?.daily?.time
      const tempMax = dadosPrevisaoDiaria?.daily?.temperature_2m_max
      const tempMin = dadosPrevisaoDiaria?.daily?.temperature_2m_min
      const chuvaMax = dadosPrevisaoDiaria?.daily?.precipitation_probability_max

      if (!Array.isArray(datas) || !Array.isArray(tempMax) || !Array.isArray(tempMin)) {
        throw new Error('Resposta inesperada da API de previsão.')
      }

      const itens = datas.map((date, index) => ({
        date,
        tempMax: Number.isFinite(Number(tempMax[index])) ? Math.round(Number(tempMax[index])) : null,
        tempMin: Number.isFinite(Number(tempMin[index])) ? Math.round(Number(tempMin[index])) : null,
        rainChanceMax:
          Array.isArray(chuvaMax) && Number.isFinite(Number(chuvaMax[index])) ? Math.round(Number(chuvaMax[index])) : null,
      }))

      setPrevisao({
        cityName: dadosClimaCidade.name,
        country: dadosClimaCidade.sys?.country,
        items: itens,
      })
    } catch (requestError) {
      setPrevisao(null)
      setErro(requestError.message || 'Ocorreu um erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="weather-app">
      <h1>Previsão</h1>

      <form onSubmit={buscarPrevisao} className="weather-form">
        <input
          type="text"
          value={cidade}
          onChange={(event) => setCidade(event.target.value)}
          placeholder="Digite uma cidade"
        />

        <select value={dias} onChange={(event) => setDias(event.target.value)} aria-label="Quantidade de dias">
          <option value={7}>Próximos 7 dias</option>
          <option value={16}>Próximos 16 dias</option>
        </select>

        <button type="submit" disabled={carregando}>
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {erro && <p className="error">{erro}</p>}

      {previsao && (
        <section className="forecast">
          <h2>
            {previsao.cityName}, {previsao.country}
          </h2>

          <ul className="forecast-list">
            {previsao.items.map((item) => (
              <li key={item.date} className="forecast-item">
                <span className="forecast-date">{formatarDia(item.date)}</span>
                <span className="forecast-temps">
                  <strong>{item.tempMax === null ? '--' : `${item.tempMax}°`}</strong>
                  <span className="forecast-sep">/</span>
                  <span>{item.tempMin === null ? '--' : `${item.tempMin}°`}</span>
                </span>
                <span className="forecast-rain">{item.rainChanceMax === null ? '--' : `${item.rainChanceMax}%`}</span>
              </li>
            ))}
          </ul>

        </section>
      )}
    </main>
  )
}
