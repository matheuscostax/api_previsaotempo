export default function TelaSobre() {
  return (
    <main className="weather-app">
      <h1>Sobre</h1>

      <section className="about">
        <p>
          Este projeto é um app React que consulta dados de clima de uma cidade e exibe as informações de forma
          simples.
        </p>

        <h2>O que ele faz</h2>
        <ul>
          <li>Busca o clima atual pelo nome da cidade</li>
          <li>Exibe temperatura, sensação térmica, umidade e vento</li>
          <li>Mostra a chance de chuva por hora (restante do dia)</li>
          <li>Muda o “tema” visual conforme condição do tempo</li>
        </ul>

        <h2>APIs usadas</h2>
        <ul>
          <li>OpenWeather: clima atual</li>
          <li>Open-Meteo: probabilidade de precipitação por hora</li>
        </ul>

        <h2>Rotas</h2>
        <ul>
          <li>/ (Clima)</li>
          <li>/previsao (Previsão diária)</li>
          <li>/sobre (Esta página)</li>
        </ul>
      </section>
    </main>
  )
}
