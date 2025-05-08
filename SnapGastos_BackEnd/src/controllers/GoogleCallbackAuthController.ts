import { Request, Response } from "express";
import oauth2Client from "../services/googleAuthService";

import { checkOrCreateSheet } from "../utils/checkOrCreateSheet";
import { google } from "googleapis";


export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const spreadsheetId = await checkOrCreateSheet(oauth2Client);

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Maio',
    });

    const dados = sheetData.data.values || [];
    res.json({ mensagem: 'login com Google OK!', spreadsheetId, dados });
  }

  catch (error) {
    console.error('Erro no callback Google:', error);
    res.status(500).send('Erro ao autenticar com Google');
  };
};