import { google } from "googleapis";
import { OAuth2Client } from 'google-auth-library';

import { nomeMesAtualEmPortugues } from "./currentMonth";


export const checkOrCreateSheet = async (auth: OAuth2Client): Promise<string> => {
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  const fileResponse = await drive.files.list({
    q: "name = 'snapgastos_2025' and mimeType = 'application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)',
  });

  let spreadsheetId: string | undefined | null = fileResponse.data.files?.[0]?.id;

  if (!spreadsheetId) {
    let currentMonth: string;
    currentMonth = nomeMesAtualEmPortugues();
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'snapgastos_2025' },
        sheets: [{ properties: { title: currentMonth } }],
      }
    });
    spreadsheetId = createRes.data.spreadsheetId!;
  }

  if (!spreadsheetId) {
    throw new Error("Não foi possível obter ou criar o spreadsheetId.");
  }
  return spreadsheetId;
};