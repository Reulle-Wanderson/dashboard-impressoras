import { obterResumoFinanceiro } from "@/lib/financeiro/obterResumoFinanceiro";

export default async function FinanceiroHome({
  searchParams,
}: {
  searchParams: Promise<{
    mes?: string;
    ano?: string;
  }>;
}) {
  // ==================================================
  // 🔓 Resolver searchParams (Next 15+)
  // ==================================================
  const params = await searchParams;

  // ==================================================
  // 📅 Definição de período
  // ==================================================
  const hoje = new Date();

  const mes = params.mes ? Number(params.mes) : hoje.getMonth() + 1;
  const ano = params.ano ? Number(params.ano) : hoje.getFullYear();

  const dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const dataFim = new Date(ano, mes, 0).toISOString().split("T")[0];

  // ==================================================
  // 📊 Dados financeiros
  // ==================================================
  const {
    custoPorFolha,
    totalImpressoMes,
    totalCustoReal,
    rankingImpressoras,
    rankingSetores,
  } = await obterResumoFinanceiro({
    dataInicio,
    dataFim,
  });

  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-4">Financeiro</h1>

      {/* =========================
          FILTROS + AÇÃO
      ========================= */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <form method="GET" className="flex gap-4 items-end">
          <div>
            <label className="text-sm">Mês</label>
            <select
              name="mes"
              defaultValue={mes}
              className="border rounded px-2 py-1"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">Ano</label>
            <select
              name="ano"
              defaultValue={ano}
              className="border rounded px-2 py-1"
            >
              {[2024, 2025, 2026].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <button className="bg-gray-800 text-white px-4 py-2 rounded">
            Filtrar
          </button>
        </form>

        <a
          href="/financeiro/papel/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 inline-block"
        >
          Registrar compra de papel
        </a>
      </div>

      {/* =========================
          CARDS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Custo médio por página</p>
          <p className="text-2xl font-bold">
            R$ {custoPorFolha.toFixed(4)}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Total impresso</p>
          <p className="text-2xl font-bold">{totalImpressoMes}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Custo total estimado</p>
          <p className="text-2xl font-bold">
            R$ {totalCustoReal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* =========================
          RANKING IMPRESSORAS
      ========================= */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Ranking de impressoras por custo
        </h2>

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
                <td className="border p-2 text-right">
                  {imp.paginasValidas}
                </td>
                <td className="border p-2 text-right">{imp.desconto}%</td>
                <td className="border p-2 text-right">
                  R$ {imp.custoMes.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* =========================
          RANKING SETORES
      ========================= */}
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
                <td className="border p-2 text-right">
                  {s.paginasValidas}
                </td>
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
