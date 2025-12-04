export function calcularTotalPaginasPorMes(
  historico: { data: string; paginas: number }[],
  referenciaAnterior: number | null
) {
  if (!historico || historico.length === 0) return 0;

  const ultimoDoMes = historico[historico.length - 1].paginas;

  // Sem referência anterior ao mês → usa apenas registros do mês
  if (referenciaAnterior === null) {
    const primeiroDoMes = historico[0].paginas;
    return Math.max(ultimoDoMes - primeiroDoMes, 0);
  }

  // Modelo profissional SNMP
  return Math.max(ultimoDoMes - referenciaAnterior, 0);
}
