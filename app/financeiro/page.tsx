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
    <section className="space-y-10">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Financeiro</h1>
        <p className="text-sm text-gray-500">
          Análise de custos e consumo por período
        </p>
      </div>

      {/* =========================
          FILTROS + AÇÃO
      ========================= */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <form method="GET" className="flex gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Mês</label>
            <select
              name="mes"
              defaultValue={mes}
              className="border rounded px-3 py-2"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Ano</label>
            <select
              name="ano"
              defaultValue={ano}
              className="border rounded px-3 py-2"
            >
              {[2024, 2025, 2026].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <button className="bg-gray-800 text-white px-5 py-2 rounded">
            Filtrar
          </button>
        </form>

        <a
          href="/financeiro/papel/nova"
          className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Registrar compra de papel
        </a>
      </div>

      {/* =========================
          CARDS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Custo médio por página</p>
          <p className="text-2xl font-bold text-blue-700">
            R$ {custoPorFolha.toFixed(4)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total impresso</p>
          <p className="text-2xl font-bold text-gray-800">
            {totalImpressoMes}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Custo total estimado</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalCustoReal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* =========================
          RANKING IMPRESSORAS
      ========================= */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Ranking de impressoras por custo
        </h2>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Impressora</th>
                <th className="p-3 text-left">Setor</th>
                <th className="p-3 text-right">Real</th>
                <th className="p-3 text-right">Válidas</th>
                <th className="p-3 text-right">Desconto</th>
                <th className="p-3 text-right">Custo</th>
              </tr>
            </thead>

            <tbody>
              {rankingImpressoras.map((imp) => (
                <tr
                  key={imp.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{imp.nome}</td>
                  <td className="p-3">{imp.setor}</td>
                  <td className="p-3 text-right">{imp.paginasMes}</td>
                  <td className="p-3 text-right">
                    {imp.paginasValidas}
                  </td>
                  <td className="p-3 text-right">{imp.desconto}%</td>
                  <td className="p-3 text-right font-medium">
                    R$ {imp.custoMes.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================
          RANKING SETORES
      ========================= */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Comparação por setor
        </h2>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Setor</th>
                <th className="p-3 text-right">Páginas reais</th>
                <th className="p-3 text-right">Páginas válidas</th>
                <th className="p-3 text-right">Custo</th>
              </tr>
            </thead>

            <tbody>
              {rankingSetores.map((s) => (
                <tr
                  key={s.setor}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{s.setor}</td>
                  <td className="p-3 text-right">{s.paginas}</td>
                  <td className="p-3 text-right">
                    {s.paginasValidas}
                  </td>
                  <td className="p-3 text-right font-medium">
                    R$ {s.custo.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
