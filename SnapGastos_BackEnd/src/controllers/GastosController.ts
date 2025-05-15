import { Response } from "express";
import { google } from "googleapis";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import oauth2Client from "../services/googleAuthService";

// CREATE -> POST
export const postAddGasto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nome, valor, categoria, data } = req.body;

  if (!nome || !valor || !categoria || !data) {
    res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    return;
  }

  try {
    const getSpreadsheetId = req.user.spreadsheetId
    const sheets = google.sheets({ version: "v4", auth: req.user.tokens || undefined });

    const novaLinha = [[nome, valor.toString(), categoria, data]];
    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId,
      range: req.user.nomeMesAtual,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: novaLinha
      }
    });

    res.status(201).json({
      mensagem: "Gasto adicionado com sucesso",
      id_planilha: getSpreadsheetId,
      mes: req.user.nomeMesAtual,
      values: novaLinha
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

    const gastos = linhas.map(([nome, valor, categoria, data]) => ({
      nome,
      valor: parseFloat(valor),
      categoria,
      data,
    }));

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