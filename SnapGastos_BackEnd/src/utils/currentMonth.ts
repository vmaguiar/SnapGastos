export function nomeMesAtualEmPortugues(): string {
  const mesesEmPortugues = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dataAtual = new Date();
  const indiceMes = dataAtual.getMonth(); // Retorna um número de 0 (jan) a 11 (dez)

  return mesesEmPortugues[indiceMes];
}