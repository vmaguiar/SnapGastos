import { google } from "googleapis";
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

import { nomeMesAtualEmPortugues } from "./currentMonth";


dotenv.config();

export const checkOrCreateSheet = async (auth: OAuth2Client): Promise<string> => {
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  const fileResponse = await drive.files.list({
    q: `mimeType = '${process.env.SHEET_MIME as string}' and appProperties has {key='${process.env.APP_KEY as string}' and value='${process.env.APP_VALUE as string}'} and trashed=false and (sharedWithMe or 'me' in owners)`,
    spaces: "drive",
    fields: 'files(id, name)',
  });

  let spreadsheetId: string | undefined | null = fileResponse.data.files?.[0]?.id;

  if (!spreadsheetId) {
    let currentMonth: string;
    currentMonth = nomeMesAtualEmPortugues();
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: process.env.SHEET_NAME as string },
        sheets: [{ properties: { title: currentMonth } }],
      }
    });
    spreadsheetId = createRes.data.spreadsheetId!;

    await drive.files.update({
      fileId: spreadsheetId,
      requestBody: {
        appProperties: {
          [process.env.APP_KEY as string]: process.env.APP_VALUE as string
        },
      }
    });
  }

  if (!spreadsheetId) {
    throw new Error("Não foi possível obter ou criar o spreadsheetId.");
  }
  return spreadsheetId;
};