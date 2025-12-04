import { obterResumoFinanceiro } from "@/lib/financeiro/obterResumoFinanceiro";

export default async function FinanceiroHome() {
  const {
    custoPorFolha,
    totalImpressoMes,
    totalCustoReal,
    rankingImpressoras,
    rankingSetores,
  } = await obterResumoFinanceiro();

  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-4">Financeiro</h1>

      {/* ================================
          CARDS GERAIS
      ================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Custo médio por página</p>
          <p className="text-2xl font-bold">R$ {custoPorFolha.toFixed(4)}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Total impresso no mês</p>
          <p className="text-2xl font-bold">{totalImpressoMes}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Custo total estimado</p>
          <p className="text-2xl font-bold">R$ {totalCustoReal.toFixed(2)}</p>
        </div>
      </div>

      {/* BOTÃO NOVA COMPRA */}
      <a
        href="/financeiro/papel/nova"
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 inline-block"
      >
        Registrar compra de papel
      </a>

      {/* ================================
          RANKING IMPRESSORAS
      ================================= */}
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

      {/* ================================
          RANKING SETORES
      ================================= */}
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
