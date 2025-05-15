import dotenv from 'dotenv';
import express from 'express'
import session from 'express-session';
import cors from 'cors';

import googleAuthRoute from './routes/googleAuthRoute'
import googleCallbackRoute from './routes/googleCallbackRoute'
import gastosRoute from './routes/gastosRoute';


// VARIAVEIS DE CONFIGURAÇÃO
dotenv.config();
const PORTA_SERVER = process.env.PORT;
const app = express();


app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));


app.use('/auth', googleAuthRoute);
app.use('/auth', googleCallbackRoute);
app.use('/gastos', gastosRoute);


app.listen(PORTA_SERVER, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORTA_SERVER}`)
});