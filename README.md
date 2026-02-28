# Consulta de Clima (OpenWeather + React)

Aplicação web feita com React + Vite para consultar o clima atual de uma cidade e exibir chance de chuva por hora.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (recomendado: versão LTS)
- npm (já vem com o Node.js)
- Conta no [OpenWeather](https://openweathermap.org/) para gerar a API key

## 1) Como criar conta no OpenWeather e gerar a chave

1. Acesse [https://openweathermap.org/](https://openweathermap.org/) e clique em **Sign In** / **Create Account**.
2. Crie sua conta com e-mail e senha.
3. Confirme o e-mail (se solicitado).
4. Faça login e acesse sua área de API keys (normalmente em **My API keys**).
5. Copie a chave gerada (API key).

> Observação: em contas novas, a chave pode levar alguns minutos para ativar.

## 2) Como instalar o projeto

No terminal, na pasta do projeto:

```bash
npm install
```

## 3) Como configurar a chave da API

Crie um arquivo chamado `.env` na raiz do projeto com o conteúdo:

```env
VITE_OPENWEATHER_API_KEY=sua_chave_aqui
```

Troque `sua_chave_aqui` pela chave copiada no OpenWeather.

## 4) Como rodar em ambiente de desenvolvimento

```bash
npm run dev
```

Depois, abra a URL exibida no terminal (geralmente `http://localhost:5173`).

## Scripts disponíveis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera build de produção
- `npm run preview`: visualiza o build localmente
- `npm run lint`: executa o lint com ESLint

## Possíveis erros comuns

- **"Chave da API não encontrada"**: verifique se o arquivo `.env` existe e se a variável está como `VITE_OPENWEATHER_API_KEY`.
- **"API key inválida ou ainda não ativada"**: confira se copiou a chave correta e aguarde alguns minutos após criar a conta.
- **Cidade não encontrada**: confirme se o nome da cidade foi digitado corretamente.
