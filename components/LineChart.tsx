"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  chartData: any;
  options?: ChartOptions<"line">;
}

export default function LineChart({ chartData, options }: LineChartProps) {
  // --------- OPÇÕES PADRÃO (CLIENT SIDE) ---------
  const defaultOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 13,
            weight: 600,
          },
        },
      },

      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 700 },
        bodyFont: { size: 13, weight: 400 },

        // ⚠️ ESSA FUNÇÃO NÃO PODE IR NO SERVER! 
        callbacks: {
          label: function (ctx: TooltipItem<"line">) {
            const valor = ctx.parsed.y ?? 0;
            return ` ${valor.toLocaleString("pt-BR")} páginas`;
          },
        },
      },
    },

    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  // --------- MERGE DE OPTIONS (SUPER SEGURO) ---------
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
      tooltip: {
        ...defaultOptions.plugins?.tooltip,
        ...options?.plugins?.tooltip,
      },
      legend: {
        ...defaultOptions.plugins?.legend,
        ...options?.plugins?.legend,
      },
    },
  };

  return (
    <div className="w-full h-[400px]">
      <Line data={chartData} options={mergedOptions} />
    </div>
  );
}
