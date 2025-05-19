import { Response } from "express";
import { google } from "googleapis";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import oauth2Client from "../services/googleAuthService";
import { formatarDataParaBR, nomeMesEmPortugues } from "../utils/currentMonth";
import { checkOrCreateTab, IdHandler } from "../utils/checkSheetTab";

// CREATE -> POST
export const postAddGasto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nome, valor, categoria, data } = req.body;

  if (!nome || !valor || !categoria || !data) {
    res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    return;
  }

  try {
    const tituloSheet = nomeMesEmPortugues(data);
    const getSpreadsheetId = req.user.spreadsheetId
    oauth2Client.setCredentials(req.user.tokens)
    const sheets = google.sheets({ version: "v4", auth: oauth2Client || undefined });

    checkOrCreateTab(sheets, getSpreadsheetId, tituloSheet);

    // const metadata = await sheets.spreadsheets.get({
    //   spreadsheetId: getSpreadsheetId
    // });
    // const sheetExists = metadata.data.sheets?.some(
    //   (sheet) => sheet.properties?.title === tituloSheet
    // );

    // if (!sheetExists) {
    //   await sheets.spreadsheets.batchUpdate({
    //     spreadsheetId: getSpreadsheetId,
    //     requestBody: {
    //       requests: [
    //         {
    //           addSheet: {
    //             properties: {
    //               title: tituloSheet
    //             }
    //           }
    //         }
    //       ]
    //     }
    //   });

    //   await sheets.spreadsheets.values.update({
    //     spreadsheetId: getSpreadsheetId,
    //     range: `${tituloSheet}!A1:D1`,
    //     valueInputOption: "USER_ENTERED",
    //     requestBody: {
    //       values: [["Nome", "Valor", "Categoria", "Data"]],
    //     },
    //   });
    // }

    const proximoID = IdHandler(sheets, getSpreadsheetId, tituloSheet);

    const dataFormatada = formatarDataParaBR(data);

    const novaLinha = [[(await proximoID).toString(), nome, valor.toString(), categoria, dataFormatada]];
    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId,
      range: `${tituloSheet}!A2:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: novaLinha
      }
    });

    // res.status(201).json({
    //   mensagem: "Gasto adicionado com sucesso",
    //   id_planilha: getSpreadsheetId,
    //   mes: req.user.nomeMesAtual,
    //   values: novaLinha
    // });
    res.status(201).json({
      mensagem: "Gasto adicionado com sucesso",
      gasto: {
        id: (await proximoID).toString(),
        nome,
        valor,
        categoria,
        data: dataFormatada
      }
    });
    return;
  }
  catch (error) {
    console.error("Erro ao adicionar gasto:", error);
    res.status(500).json({ erro: "Erro interno ao adicionar gasto" });
    return;
  }
  // console.log("add um gasto na planilha");
};

// READ -> GET
export const getAllMonthlyGastos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { spreadsheetId, sheetTitle, tokens } = req.user;

    oauth2Client.setCredentials(tokens)

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A2:D`
    });

    const linhas = response.data.values || [];

    const gastos = linhas.map((linha) => ({
      id: linha[0],
      nome: linha[1],
      valor: parseFloat(linha[2]),
      categoria: linha[3],
      data: linha[4],
    })).filter(g => g.nome);

    res.status(200).json({ gastos });
  }
  catch (error) {
    console.error("Erro ao buscar gastos:", error);
    res.status(500).json({ erro: "Erro ao buscar dados da planilha" });
  }
};

export const getGasto = () => {
  console.log("retorna apenas o gasto relacionado ao ID");
};

// UPDATE -> PUT OR PATCH
export const updateGasto = () => {
  console.log("atualiza o gasto de ID e passa os dados para atualizar");
};

// DELETE - DELETE
export const deleteGasto = () => {
  console.log("deleta o gasto de ID");
};