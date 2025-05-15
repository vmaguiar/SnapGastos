import { Request, Response } from "express";
import { google } from "googleapis";
import oauth2Client from "../services/googleAuthService";
import jwt from 'jsonwebtoken';

import { checkOrCreateSheet } from "../utils/checkOrCreateSheet";
import { nomeMesAtualEmPortugues } from "../utils/currentMonth";


export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  const nomeMesAtual = nomeMesAtualEmPortugues();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    //obter dados do usuario
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfoResponse = await oauth2.userinfo.get();
    const user = userInfoResponse.data;

    // obter dados da planilha
    const spreadsheetId = await checkOrCreateSheet(oauth2Client);

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    // const sheetData = await sheets.spreadsheets.values.get({
    //   spreadsheetId,
    //   range: nomeMesAtual,
    // });

    req.session.user = {
      name: user.name as string,
      email: user.email as string,
      picture: user.picture as string,
      spreadsheetId,
      sheetTitle: nomeMesAtual as string,
      tokens
    };


    const jwtToken = jwt.sign({
      name: user.name as string,
      picture: user.picture as string,
      email: user.email as string
    },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );


    // const dados = sheetData.data.values || [];
    //criar o token jwt
    // const tokenPayload = {
    //   name,
    //   picture,
    //   email,
    //   spreadsheetId,
    //   nomeMesAtual,
    //   dados,
    // }
    // const tokenDados = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    //   expiresIn: '1h',
    // });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${jwtToken}`);
    // res.json({ mensagem: 'login com Google OK!', spreadsheetId, dados });
  }

  catch (error) {
    console.error('Erro no callback Google:', error);
    res.status(500).send('Erro ao autenticar com Google');
  };
};