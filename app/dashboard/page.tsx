"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LineChart from "@/components/LineChart";

type Registro = {
  printer_id: string;
  data: string;
  paginas: number;
};

type Printer = {
  id: string;
  nome: string;
};

export default function Dashboard() {
  const [chartData, setChartData] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});
  const [printersList, setPrintersList] = useState<Printer[]>([]);

  // ------------------------------------------------------------
  // 🔹 CARREGA LISTA DE IMPRESSORAS PARA O DROPDOWN
  // ------------------------------------------------------------
  useEffect(() => {
    async function carregarImpressoras() {
      const { data } = await supabase
        .from("printers")
        .select("id, nome")
        .order("nome", { ascending: true });

      setPrintersList(data || []);
    }

    carregarImpressoras();
  }, []);

  // ------------------------------------------------------------
  // 🔹 CARREGA DADOS DO GRÁFICO COM FILTROS
  // ------------------------------------------------------------
  useEffect(() => {
    carregar();
  }, [filters]);

  async function carregar() {
    let query = supabase
      .from("consumo_impressoras")
      .select("printer_id, data, paginas")
      .order("printer_id", { ascending: true })
      .order("data", { ascending: true });

    // ✔ FILTRO POR IMPRESSORA
    if (filters.printer) {
      query = query.eq("printer_id", filters.printer);
    }

    // ✔ FILTRO POR DATA INÍCIO
    if (filters.dataInicio) {
      query = query.gte("data", filters.dataInicio);
    }

    // ✔ FILTRO POR DATA FIM
    if (filters.dataFim) {
      query = query.lte("data", filters.dataFim);
    }

    const { data, error } = await query;
    if (!data || error) return;

    // ------------------------------------------------------------
    // 🔹 ORGANIZA REGISTROS POR IMPRESSORA
    // ------------------------------------------------------------
    const porImpressora = new Map<string, Registro[]>();

    for (const r of data) {
      if (!porImpressora.has(r.printer_id)) {
        porImpressora.set(r.printer_id, []);
      }
      porImpressora.get(r.printer_id)!.push(r);
    }

    // ------------------------------------------------------------
    // 🔹 CALCULA TOTAL DE PÁGINAS POR DIA (COM DIFERENÇA)
    // ------------------------------------------------------------
    const totalPorDia = new Map<string, number>();

    for (const registros of porImpressora.values()) {
      registros.forEach((r, i) => {
        if (i === 0) {
          totalPorDia.set(r.data, (totalPorDia.get(r.data) ?? 0));
          return;
        }

        const anterior = registros[i - 1];
        const valorDoDia = Math.max(r.paginas - anterior.paginas, 0);

        totalPorDia.set(r.data, (totalPorDia.get(r.data) ?? 0) + valorDoDia);
      });
    }

    const labels = [...totalPorDia.keys()].sort();
    const valores = labels.map((d) => totalPorDia.get(d) ?? 0);

    // ------------------------------------------------------------
    // 🔹 MÉDIA MÓVEL DE 7 DIAS
    // ------------------------------------------------------------
    function mediaMovel(arr: number[], dias: number) {
      return arr.map((_, i) => {
        const inicio = Math.max(0, i - dias + 1);
        const subset = arr.slice(inicio, i + 1);
        const media = subset.reduce((s, v) => s + v, 0) / subset.length;
        return Number(media.toFixed(2));
      });
    }

    const media7dias = mediaMovel(valores, 7);

    // ------------------------------------------------------------
    // 🔹 MONTA DADOS PARA O GRÁFICO
    // ------------------------------------------------------------
    setChartData({
      labels: labels.map((d) => new Date(d).toLocaleDateString("pt-BR")),
      datasets: [
        {
          label: "Total diário (todas impressoras)",
          data: valores,
          borderWidth: 2,
          tension: 0.35,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.25)",
          pointBackgroundColor: "#1d4ed8",
          pointRadius: 4,
        },
        {
          label: "Média móvel (7 dias)",
          data: media7dias,
          borderWidth: 2,
          tension: 0.35,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          pointRadius: 0,
          borderDash: [6, 4],
        },
      ],
    });
  }

  // ------------------------------------------------------------
  // 🔹 FUNÇÃO DO FILTRO
  // ------------------------------------------------------------
  function aplicarFiltros(f: any) {
    setFilters(f);
  }

  // ------------------------------------------------------------
  // 🔹 CARREGANDO
  // ------------------------------------------------------------
  if (!chartData) return <div className="p-6">Carregando...</div>;

  // ------------------------------------------------------------
  // 🔹 INTERFACE COMPLETA
  // ------------------------------------------------------------
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Geral</h1>

      {/* ------------------ FILTRO ------------------ */}
      <div className="flex gap-4 mb-6 bg-gray-100 p-4 rounded-lg items-end">
        {/* Impressora */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Impressora</label>
          <select
            className="border p-2 rounded min-w-[200px]"
            value={filters.printer || ""}
            onChange={(e) => aplicarFiltros({
              ...filters,
              printer: e.target.value || null,
            })}
          >
            <option value="">Todas</option>
            {printersList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Data início */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Data início</label>
          <input
            type="date"
            className="border p-2 rounded"
            value={filters.dataInicio || ""}
            onChange={(e) => aplicarFiltros({
              ...filters,
              dataInicio: e.target.value || null,
            })}
          />
        </div>

        {/* Data fim */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Data fim</label>
          <input
            type="date"
            className="border p-2 rounded"
            value={filters.dataFim || ""}
            onChange={(e) => aplicarFiltros({
              ...filters,
              dataFim: e.target.value || null,
            })}
          />
        </div>

      </div>

      {/* ------------------ GRÁFICO ------------------ */}
      <div className="w-full bg-white p-6 rounded-lg shadow">
        <LineChart chartData={chartData} />
      </div>
    </main>
  );
}
