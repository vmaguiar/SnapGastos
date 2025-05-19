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