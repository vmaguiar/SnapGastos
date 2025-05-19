import { sheets_v4 } from "googleapis";

export async function checkOrCreateTab(sheets: sheets_v4.Sheets, spreadsheetId: any, tituloSheet: string) {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = metadata.data.sheets?.some(
    (sheet) => sheet.properties?.title === tituloSheet
  );

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: tituloSheet
              }
            }
          }
        ]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${tituloSheet}!A1:D1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["ID", "Nome", "Valor", "Categoria", "Data"]],
      },
    });
  }
}

export async function IdHandler(sheets: sheets_v4.Sheets, spreadsheetId: any, tituloSheet: string) {
  const existingRows = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tituloSheet}!A2:A`,
  });

  const numLinhas = existingRows.data.values?.length || 0;
  const proximoID = numLinhas + 1;
  return proximoID;
}