import dotenv from 'dotenv';
import express from 'express'
import session from 'express-session';

// import authRoutes from './routes/authRoutes'
import googleAuthRoute from './routes/googleAuthRoute'
import googleCallbackRoute from './routes/googleCallbackRoute'


// VARIAVEIS DE CONFIGURAÇÃO
dotenv.config();
// const PORTA_SERVER = 3000
const PORTA_SERVER = process.env.PORT;
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true
}));


app.use('/auth', googleAuthRoute);
app.use('/auth', googleCallbackRoute);


app.listen(PORTA_SERVER, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORTA_SERVER}`)
});