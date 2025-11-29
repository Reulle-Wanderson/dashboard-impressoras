"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LineChart from "@/components/LineChart";

type Registro = {
  printer_id: string;
  data: string;
  paginas: number;
};

export default function Dashboard() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("consumo_impressoras")
        .select("printer_id, data, paginas")
        .order("printer_id", { ascending: true })
        .order("data", { ascending: true });

      if (!data || error) return;

      const porImpressora = new Map<string, Registro[]>();

      for (const r of data) {
        if (!porImpressora.has(r.printer_id))
          porImpressora.set(r.printer_id, []);
        porImpressora.get(r.printer_id)!.push(r);
      }

      // TOTAL POR DIA
      const totalPorDia = new Map<string, number>();

      for (const registros of porImpressora.values()) {
        registros.forEach((r, i) => {

          // ✔ PRIMEIRO REGISTRO → não tem consumo, então valor = 0
          if (i === 0) {
            totalPorDia.set(r.data, (totalPorDia.get(r.data) ?? 0));
            return;
          }

          // ✔ CONSUMO REAL
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

      const media7dias = mediaMovel(valores, 7);

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

    carregar();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: 12,
        titleFont: { size: 14, weight: 700 },
        bodyFont: { size: 13, weight: 400 },
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.parsed.y.toLocaleString("pt-BR")} páginas`,
        },
      },
      legend: {
        position: "top",
        labels: { font: { size: 13, weight: 600 } },
      },
    },
  };

  if (!chartData) return <div className="p-6">Carregando...</div>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Geral</h1>

      <div className="w-full bg-white p-6 rounded-lg shadow">
        <LineChart chartData={chartData} />
      </div>
    </main>
  );
}
