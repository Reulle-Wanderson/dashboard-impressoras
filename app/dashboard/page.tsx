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

  // ==================================================
  // 🔹 LISTA DE IMPRESSORAS
  // ==================================================
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

  // ==================================================
  // 🔹 CARREGA DADOS COM FILTROS
  // ==================================================
  useEffect(() => {
    carregar();
  }, [filters]);

  async function carregar() {
    let query = supabase
      .from("consumo_impressoras")
      .select("printer_id, data, paginas")
      .order("printer_id", { ascending: true })
      .order("data", { ascending: true });

    if (filters.printer) query = query.eq("printer_id", filters.printer);
    if (filters.dataInicio) query = query.gte("data", filters.dataInicio);
    if (filters.dataFim) query = query.lte("data", filters.dataFim);

    const { data, error } = await query;
    if (!data || error) return;

    const porImpressora = new Map<string, Registro[]>();

    for (const r of data) {
      if (!porImpressora.has(r.printer_id)) {
        porImpressora.set(r.printer_id, []);
      }
      porImpressora.get(r.printer_id)!.push(r);
    }

    const totalPorDia = new Map<string, number>();

    for (const registros of porImpressora.values()) {
      registros.forEach((r, i) => {
        if (i === 0) return;

        const anterior = registros[i - 1];
        const valorDoDia = Math.max(r.paginas - anterior.paginas, 0);

        totalPorDia.set(r.data, (totalPorDia.get(r.data) ?? 0) + valorDoDia);
      });
    }

    const labels = [...totalPorDia.keys()].sort();
    const valores = labels.map((d) => totalPorDia.get(d) ?? 0);

    function mediaMovel(arr: number[], dias: number) {
      return arr.map((_, i) => {
        const inicio = Math.max(0, i - dias + 1);
        const subset = arr.slice(inicio, i + 1);
        const media = subset.reduce((s, v) => s + v, 0) / subset.length;
        return Number(media.toFixed(2));
      });
    }

    const media7dias = mediaMovel(valores, 7)
    setChartData({
      labels: labels.map((d) =>
        new Date(d).toLocaleDateString("pt-BR")
      ),
      datasets: [
        {
          label: "Total diário",
          data: valores,
          borderWidth: 2,
          tension: 0.35,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.2)",
          pointRadius: 3,
        },
        {
          label: "Média móvel (7 dias)",
          data: media7dias,
          borderWidth: 2,
          tension: 0.35,
          borderColor: "#10b981",
          borderDash: [6, 4],
          pointRadius: 0,
        },
      ],
    });
  }

  if (!chartData) {
    return <div className="p-6 text-gray-600">Carregando dashboard...</div>;
  }

  return (
    <section className="space-y-8">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Geral
        </h1>
        <p className="text-sm text-gray-500">
          Visão consolidada do consumo de páginas
        </p>
      </div>

      {/* =========================
          FILTROS
      ========================= */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Impressora
          </label>
          <select
            className="border rounded px-3 py-2 min-w-55"
            value={filters.printer || ""}
            onChange={(e) =>
              setFilters({ ...filters, printer: e.target.value || null })
            }
          >
            <option value="">Todas</option>
            {printersList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Data início
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={filters.dataInicio || ""}
            onChange={(e) =>
              setFilters({ ...filters, dataInicio: e.target.value || null })
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Data fim
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={filters.dataFim || ""}
            onChange={(e) =>
              setFilters({ ...filters, dataFim: e.target.value || null })
            }
          />
        </div>
      </div>

      {/* =========================
          GRÁFICO
      ========================= */}
      <div className="bg-white p-6 rounded-lg shadow">
        <LineChart chartData={chartData} />
      </div>
    </section>
  );
}
