
# API Previsão do Tempo (React + Vite)

Aplicação web para consultar **clima atual** e **previsões** a partir do nome de uma cidade.

## Funcionalidades

- Consulta de clima atual (temperatura, sensação, umidade, vento e descrição).
- Chance de chuva **por hora** (restante do dia).
- Previsão diária para **7 ou 16 dias** (máx/mín e chance de chuva).

## APIs usadas

- **OpenWeather**: busca da cidade + clima atual + coordenadas (latitude/longitude).
- **Open-Meteo**: previsão por hora e previsão diária usando latitude/longitude.

## Tecnologias

- React
- React Router
- Vite

## Como rodar o projeto

Pré-requisito: Node.js instalado (versão recente recomendada).

1) Instale as dependências:

```bash
npm install
```

2) Crie um arquivo `.env` na raiz do projeto e coloque sua chave da OpenWeather:

```bash
VITE_OPENWEATHER_API_KEY=SUA_CHAVE_AQUI
```

3) Rode em modo desenvolvimento:

```bash
npm run dev
```

Abra a URL que o Vite mostrar no terminal.

## Scripts disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento.
- `npm run build` — gera a build de produção.
- `npm run preview` — pré-visualiza a build.
- `npm run lint` — roda o ESLint.

## Dicas e possíveis erros

- **"Chave da API não encontrada"**: verifique se o `.env` existe e contém `VITE_OPENWEATHER_API_KEY`.
- **Erro 401 (API key inválida ou não ativada)**: confira a chave e aguarde alguns minutos (algumas chaves demoram a ativar).
- **Cidade não encontrada**: verifique a grafia e tente com/sem acentos.

