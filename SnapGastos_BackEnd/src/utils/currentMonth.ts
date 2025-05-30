const mesesEmPortugues = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function nomeMesAtualEmPortugues(): string {
  // const mesesEmPortugues = [
  //   'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  //   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  // ];

  const dataAtual = new Date();
  const indiceMes = dataAtual.getMonth(); // Retorna um número de 0 (jan) a 11 (dez)

  return mesesEmPortugues[indiceMes];
}

export function nomeMesEmPortugues(data: string) {
  const tentaPegarMes = data.split('-')
  return mesesEmPortugues[parseInt(tentaPegarMes[1]) - 1];
  // const indiceMes = data.getMonth();
  // return mesesEmPortugues[indiceMes];
}

export function formatarDataParaBR(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function numMesParaNome(mes: string) {
  return mesesEmPortugues[parseInt(mes) - 1];
}

export function arrayDiasDoMes(data: string) {
  const [anoStr, mesStr] = data.split('-');
  const ano = parseInt(anoStr, 10);
  const mesIdx = parseInt(mesStr, 10) - 1;
  const dias: string[] = [];

  const ultimoDia = new Date(ano, mesIdx + 1, 0).getDate();
  for (let d = 1; d <= ultimoDia; d++) {
    const diaStr = String(d).padStart(2, '0');
    const mesStr = String(mesIdx + 1).padStart(2, '0');

    dias.push(`${ano}-${mesStr}-${diaStr}`);
  }
  return dias;
}