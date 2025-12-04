"use client";

import { useState, useMemo } from "react";
import LineChart from "@/components/LineChart";
import { calcularTotalPaginas } from "@/lib/calcularTotalPaginas"; // ✅ import no topo

interface ConsumoRegistro {
  data: string;
  paginas: number;
}

export default function FiltroPeriodo({ historico }: { historico: ConsumoRegistro[] }) {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  // 🔹 Filtrar por período
  const filtrados = useMemo(() => {
    const start = inicio ? new Date(inicio + "T00:00") : null;
    const end = fim ? new Date(fim + "T23:59") : null;

    return historico.filter((h) => {
      const d = new Date(h.data + "T00:00");
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [inicio, fim, historico]);

  // 🔹 Agora usa a lib centralizada
  const totalPeriodo = useMemo(() => {
    return calcularTotalPaginas(filtrados);
  }, [filtrados]);

  // 🔹 Cálculo por dia
  const paginasPorDia = filtrados.map((c, i) =>
    i === 0 ? 0 : c.paginas - filtrados[i - 1].paginas
  );

  const chartData = {
    labels: filtrados.map((h) =>
      new Date(h.data).toLocaleDateString("pt-BR")
    ),
    datasets: [
      {
        label: "Páginas no dia",
        data: paginasPorDia,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className="bg-white p-4 rounded shadow max-w-4xl">
        <h2 className="text-lg font-semibold mb-3">Filtrar por período</h2>

        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-gray-600">Início</label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Fim</label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="mt-1 p-2 border rounded"
            />
          </div>

          <button
            onClick={() => {
              setInicio("");
              setFim("");
            }}
            className="self-end p-2 bg-gray-200 border rounded"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* TOTAL DO PERÍODO */}
      <div className="bg-white p-4 rounded shadow max-w-4xl">
        <h2 className="text-xl font-semibold mb-2">Total no período</h2>

        <p className="text-3xl font-bold text-green-700">
          {totalPeriodo.toLocaleString("pt-BR")}
        </p>

        {filtrados.length > 1 && (
          <p className="text-sm text-gray-500 mt-1">
            De{" "}
            {new Date(filtrados[0].data).toLocaleDateString("pt-BR")} até{" "}
            {new Date(
              filtrados[filtrados.length - 1].data
            ).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-6 rounded shadow max-w-4xl">
        <LineChart chartData={chartData} />
      </div>

      {/* TABELA */}
      {filtrados.length > 0 ? (
        <table className="w-full max-w-4xl border border-gray-300 bg-white rounded shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Total acumulado</th>
              <th className="p-2 border">Páginas no dia</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c, i) => (
              <tr key={c.data}>
                <td className="p-2 border">
                  {new Date(c.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-2 border">{c.paginas}</td>
                <td className="p-2 border">
                  {i === 0 ? 0 : c.paginas - filtrados[i - 1].paginas}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum registro no período.</p>
      )}
    </div>
  );
}
