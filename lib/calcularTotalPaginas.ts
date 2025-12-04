export function calcularTotalPaginas(
  historico: { data: string; paginas: number }[]
) {
  if (!historico || historico.length < 2) return 0;

  // garantir ordem correta
  const ordenado = [...historico].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  const primeiro = ordenado[0].paginas;
  const ultimo = ordenado[ordenado.length - 1].paginas;

  return Math.max(ultimo - primeiro, 0);
}
