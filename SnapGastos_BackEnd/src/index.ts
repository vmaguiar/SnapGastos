import express from 'express'

// VARIAVEIS DE CONFIGURAÇÃO
const PORTA_SERVER = 3000
const app = express();

app.use(express.json());

app.listen(PORTA_SERVER, () => {
  console.log(`🚀 Servidor rodando na porta ${PORTA_SERVER}`)
});