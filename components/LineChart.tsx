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

// ==================================================
// REGISTRO DOS MÓDULOS
// ==================================================
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

// ==================================================
// PROPS
// ==================================================
interface LineChartProps {
  chartData: any;
  options?: ChartOptions<"line">;

  // Layout
  title?: string;
  subtitle?: string;
  height?: number; // altura em px
}

// ==================================================
// COMPONENTE
// ==================================================
export default function LineChart({
  chartData,
  options,
  title,
  subtitle,
  height = 360,
}: LineChartProps) {
  // ==================================================
  // OPÇÕES PADRÃO (CLIENT ONLY)
  // ==================================================
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
            weight: 600, // ✅ number, não string
          },
        },
      },

      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 700, // ✅ number, não string
        },
        bodyFont: {
          size: 13,
        },

        // ⚠️ callbacks só no client
        callbacks: {
          label: function (ctx: TooltipItem<"line">) {
            const valor = ctx.parsed.y ?? 0;
            return ` ${valor.toLocaleString("pt-BR")} páginas`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  // ==================================================
  // MERGE SEGURO DAS OPTIONS
  // ==================================================
  const mergedOptions: ChartOptions<"line"> = {
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

  // ==================================================
  // JSX
  // ==================================================
  return (
    <section className="bg-white p-6 rounded-lg shadow space-y-4">
      {/* Cabeçalho opcional */}
      {(title || subtitle) && (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Gráfico */}
      <div style={{ height }}>
        <Line data={chartData} options={mergedOptions} />
      </div>
    </section>
  );
}
