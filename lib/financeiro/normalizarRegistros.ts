export function normalizarRegistros(registros: any[]) {
  const mapa = new Map<
    string,
    {
      nome: string;
      setor: string | null;
      desconto: number;
      registros: { data: string; paginas: number }[];
    }
  >();

  for (const r of registros) {
    const info = Array.isArray(r.printers) ? r.printers[0] : r.printers;

    if (!mapa.has(r.printer_id)) {
      mapa.set(r.printer_id, {
        nome: info?.nome ?? "Sem nome",
        setor: info?.setor ?? "Sem setor",
        desconto: info?.desconto_borrao ?? 0,
        registros: [],
      });
    }

    mapa.get(r.printer_id)!.registros.push({
      data: r.data,
      paginas: r.paginas,
    });
  }

  return mapa;
}
