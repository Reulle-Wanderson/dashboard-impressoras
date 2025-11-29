import { supabase } from "@/lib/supabase"; 

type CompraPapel = {
  quantidade_folhas: number;
  valor_total: number;
  data: string;
};

type RegistroConsumo = {
  printer_id: string;
  data: string;
  paginas: number;
  printers: {
    nome: string;
    setor: string | null;
    desconto_borrao: number | null;
  } | null; // ← Correção importante
};

export default async function FinanceiroHome() {
  // 🔹 Data de início do mês
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // 🔹 Compras de papel
  const { data: compras } = await supabase
    .from("compras_papel")
    .select("quantidade_folhas, valor_total, data")
    .gte("data", inicioMes);

  const comprasCast = (compras ?? []) as CompraPapel[];

  const totalFolhasCompradas = comprasCast.reduce(
    (s, c) => s + c.quantidade_folhas,
    0
  );

  const totalGastoMes = comprasCast.reduce(
    (s, c) => s + Number(c.valor_total),
    0
  );

  const custoPorFolha =
    totalFolhasCompradas > 0 ? totalGastoMes / totalFolhasCompradas : 0;

  // 🔹 Consumo das impressoras no mês + JOIN com tabela printers
  const { data: registros } = await supabase
    .from("consumo_impressoras")
    .select(`
      printer_id,
      data,
      paginas,
      printers (
        nome,
        setor,
        desconto_borrao
      )
    `)
    .gte("data", inicioMes)
    .order("data", { ascending: true });

  const registrosCast: RegistroConsumo[] = registros?.map((r) => ({
  printer_id: r.printer_id,
  data: r.data,
  paginas: r.paginas,
  printers: Array.isArray(r.printers) ? r.printers[0] : r.printers
})) ?? [];


  // 🔹 Agrupar por impressora
  const porImpressora = new Map<
    string,
    {
      nome: string;
      setor: string | null;
      desconto: number;
      primeiro: number;
      ultimo: number;
    }
  >();

  for (const r of registrosCast) {
    const atual = porImpressora.get(r.printer_id);

    const desconto = r.printers?.desconto_borrao ?? 0;

    if (!atual) {
      porImpressora.set(r.printer_id, {
        nome: r.printers?.nome ?? "Sem nome",
        setor: r.printers?.setor ?? "Sem setor",
        desconto,
        primeiro: r.paginas,
        ultimo: r.paginas,
      });
    } else {
      atual.ultimo = r.paginas;
    }
  }

  // 🔹 Transformar em lista + aplicar desconto
  const rankingImpressoras = Array.from(porImpressora.entries())
    .map(([id, info]) => {
      const paginasMes = Math.max(info.ultimo - info.primeiro, 0);

      // 🟡 DESCONTO DE BORRÃO (%)
      const paginasValidas = Math.floor(
        paginasMes * (1 - info.desconto / 100)
      );

      const custoMes = paginasValidas * custoPorFolha;

      return {
        id,
        nome: info.nome,
        setor: info.setor,
        desconto: info.desconto,
        paginasMes,
        paginasValidas,
        custoMes,
      };
    })
    .sort((a, b) => b.custoMes - a.custoMes);

  // 🔹 Totais gerais
  const totalImpressoMes = rankingImpressoras.reduce(
    (s, imp) => s + imp.paginasMes,
    0
  );

  const totalCustoReal = rankingImpressoras.reduce(
    (s, imp) => s + imp.custoMes,
    0
  );

  // 🔹 Comparação por setor
  const porSetor = new Map<
    string,
    { paginas: number; paginasValidas: number; custo: number }
  >();

  for (const imp of rankingImpressoras) {
    const setor = imp.setor ?? "Sem setor";
    const atual = porSetor.get(setor) ?? {
      paginas: 0,
      paginasValidas: 0,
      custo: 0,
    };

    atual.paginas += imp.paginasMes;
    atual.paginasValidas += imp.paginasValidas;
    atual.custo += imp.custoMes;

    porSetor.set(setor, atual);
  }

  const rankingSetores = Array.from(porSetor.entries()).map(
    ([setor, dados]) => ({
      setor,
      paginas: dados.paginas,
      paginasValidas: dados.paginasValidas,
      custo: dados.custo,
    })
  );

  // -------------------------------------------------------------------
  // RENDERIZAÇÃO
  // -------------------------------------------------------------------
  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-4">Financeiro</h1>

      {/* Cards gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Custo médio por página</p>
          <p className="text-2xl font-bold">
            R$ {custoPorFolha.toFixed(4)}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Total impresso no mês</p>
          <p className="text-2xl font-bold">{totalImpressoMes}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Custo total estimado</p>
          <p className="text-2xl font-bold">
            R$ {totalCustoReal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botão registrar compra */}
      <a
        href="/financeiro/papel/nova"
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 inline-block"
      >
        Registrar compra de papel
      </a>

      {/* Ranking Impressoras */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ranking de impressoras por custo</h2>

        <table className="w-full border border-gray-300 text-sm bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Impressora</th>
              <th className="border p-2 text-left">Setor</th>
              <th className="border p-2 text-right">Real</th>
              <th className="border p-2 text-right">Válidas</th>
              <th className="border p-2 text-right">Desconto</th>
              <th className="border p-2 text-right">Custo</th>
            </tr>
          </thead>

          <tbody>
            {rankingImpressoras.map((imp) => (
              <tr key={imp.id}>
                <td className="border p-2">{imp.nome}</td>
                <td className="border p-2">{imp.setor}</td>
                <td className="border p-2 text-right">{imp.paginasMes}</td>
                <td className="border p-2 text-right">{imp.paginasValidas}</td>
                <td className="border p-2 text-right">{imp.desconto}%</td>
                <td className="border p-2 text-right">
                  R$ {imp.custoMes.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Comparação por Setor */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Comparação por setor</h2>

        <table className="w-full border border-gray-300 text-sm bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Setor</th>
              <th className="border p-2 text-right">Páginas reais</th>
              <th className="border p-2 text-right">Páginas válidas</th>
              <th className="border p-2 text-right">Custo</th>
            </tr>
          </thead>

          <tbody>
            {rankingSetores.map((s) => (
              <tr key={s.setor}>
                <td className="border p-2">{s.setor}</td>
                <td className="border p-2 text-right">{s.paginas}</td>
                <td className="border p-2 text-right">{s.paginasValidas}</td>
                <td className="border p-2 text-right">
                  R$ {s.custo.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
