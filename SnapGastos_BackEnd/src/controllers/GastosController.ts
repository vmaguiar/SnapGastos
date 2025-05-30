import { Response } from "express";
import { google } from "googleapis";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import oauth2Client from "../services/googleAuthService";
import { arrayDiasDoMes, formatarDataParaBR, nomeMesEmPortugues, numMesParaNome } from "../utils/currentMonth";
import { checkOrCreateTab, getTabIdByTitle, IdHandler } from "../utils/checkSheetTab";

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
      range: `${tituloSheet}!A2:E`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: novaLinha
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId,
      range: `${tituloSheet}!G1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[(await proximoID).toString()]],
      },
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
      range: `${sheetTitle}!A2:E`
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
    // console.log(gastos);
  }
  catch (error) {
    console.error("Erro ao buscar gastos:", error);
    res.status(500).json({ erro: "Erro ao buscar dados da planilha" });
  }
};


export const getGastosPorCategoria = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const mesGasto = req.query.mes as string;
  if (!mesGasto) {
    res.status(400).json({ erro: 'mes é obrigatório' });
    return;
  }
  const tituloTab = numMesParaNome(mesGasto as string);

  const spreadsheetId = req.user.spreadsheetId;
  oauth2Client.setCredentials(req.user.tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  try {
    const range = `${tituloTab}!A2:E`;
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const linhas = sheetResponse.data.values || [];

    const resumoCategoria: Record<string, number> = {};

    linhas.forEach(linha => {
      const valor = parseFloat(linha[2]);
      const categoria = linha[3];
      if (!isNaN(valor)) {
        resumoCategoria[categoria] = (resumoCategoria[categoria] || 0) + valor;
      }
    });

    res.json({ resumoCategoria: resumoCategoria });
  }
  catch (error) {
    console.error('Erro ao analisar por categoria:', error);
    res.status(500).json({ erro: 'Falha ao obter análise por categoria.' });
  }
}


export const getGastosPorDia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const dataGastos = req.query.data as string;
  console.log(dataGastos);
  if (!dataGastos) {
    res.status(400).json({ erro: 'mes é obrigatório' });
    return;
  }

  const tituloTab = nomeMesEmPortugues(dataGastos as string);
  console.log(tituloTab);

  const spreadsheetId = req.user.spreadsheetId;
  oauth2Client.setCredentials(req.user.tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  try {
    const range = `${tituloTab}!A2:E`;
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    const linhas = sheetResponse.data.values || [];

    const totais: Record<string, number> = {};

    linhas.forEach(l => {
      const valor = parseFloat(l[2]);
      const dataBr = l[4] // dd/mm/aaaa

      if (!isNaN(valor) && dataBr) {
        const [dia, mes, ano] = dataBr.split('/');
        const iso = `${ano}-${mes}-${dia}`;   // yyyy-MM-dd
        totais[iso] = (totais[iso] || 0) + valor;
      }
    });


    const diasMes = arrayDiasDoMes(dataGastos);
    const resultado: Record<string, number> = {};
    diasMes.forEach(d => resultado[d] = totais[d] || 0);
    res.json({ gastosPorDia: resultado });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Front: Falha ao obter análise por dia' });
  }
}


// UPDATE -> PUT OR PATCH
export const updateGasto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const idGasto = req.params.id;
  const mesGasto = req.query.mes;
  const tituloTab = nomeMesEmPortugues(mesGasto as string);
  const nomeGasto = req.body.nome;
  const valorGasto = req.body.valor;
  const categoriaGasto = req.body.categoria;
  const dataGasto = req.body.data;

  const spreadsheetId = req.user.spreadsheetId;
  const range = `${tituloTab}!A2:E`;

  oauth2Client.setCredentials(req.user.tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client || undefined });

  try {
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range
    });

    const linhas = sheetRes.data.values || [];
    const linhaIndex = linhas.findIndex(linha => linha[0] === idGasto);

    if (linhaIndex === -1) {
      res.status(404).json({ erro: 'ID não encontrado' });
      return;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tituloTab}!A${linhaIndex + 2}:E${linhaIndex + 2}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [idGasto, nomeGasto, valorGasto, categoriaGasto, dataGasto]
        ]
      }
    });

    const gastosAtualizados = await sheets.spreadsheets.values.get({ spreadsheetId, range });

    res.status(200).json({
      mensagem: 'Gasto atualizado com sucesoo!',
      gastosAtualizados: gastosAtualizados || []
    });
  }
  catch (error) {
    console.error('Erro ao atualizar gasto:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
};


// DELETE - DELETE
export const deleteGasto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const idGasto = req.params.id;
  const mesGasto = req.query.mes;
  const tituloTab = nomeMesEmPortugues(mesGasto as string);

  const spreadsheetId = req.user.spreadsheetId;
  oauth2Client.setCredentials(req.user.tokens);
  const sheets = google.sheets({ version: "v4", auth: oauth2Client || undefined });

  try {
    const range = `${tituloTab}!A2:E`;
    const planilhaResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const linhas = planilhaResponse.data.values || [];
    const linhaIndex = linhas.findIndex(linha => linha[0] === idGasto);

    if (linhaIndex === -1) {
      res.status(404).json({ erro: 'ID não encontrado' });
      return;
    }

    const gastoRemovido = linhas[linhaIndex];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getTabIdByTitle(sheets, spreadsheetId, tituloTab),
                dimension: "ROWS",
                startIndex: linhaIndex + 1,
                endIndex: linhaIndex + 2
              }
            }
          }
        ]
      }
    });

    const updatedResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });

    res.status(200).json({
      mensagem: 'Gasto removido com sucessooo',
      gastoRemovido: {
        id: gastoRemovido[0],
        nome: gastoRemovido[1],
        valor: gastoRemovido[2],
        categoria: gastoRemovido[3],
        data: gastoRemovido[4]
      },
      gastosAtualizados: updatedResponse.data.values || []
    });
  }
  catch (error) {
    console.error('Erro ao deletar gasto:', error);
    res.status(500).json({ erro: 'Erro interno ao deletar gasto' });
  }
};