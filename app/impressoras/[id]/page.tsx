import Link from "next/link";
import LineChart from "@/components/LineChart";
import { supabase } from "@/lib/supabase";
import { EditarDescontoBorrao } from "./EditarDescontoBorrao";

interface ConsumoRegistro {
  data: string;
  paginas: number;
}

export default async function ImpressoraDetalhes({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🔥 Resolvendo params corretamente
  const { id } = await params;

  // Buscar impressora
  const { data: impressora } = await supabase
    .from("printers")
    .select("*")
    .eq("id", id)
    .single();

  if (!impressora) {
    return (
      <div className="p-8 text-red-600">Impressora não encontrada ❌</div>
    );
  }

  // Buscar histórico
  const { data: consumos } = await supabase
    .from("consumo_impressoras")
    .select("data, paginas")
    .eq("printer_id", id)
    .order("data", { ascending: true });

  const historico: ConsumoRegistro[] = consumos ?? [];

  const paginasPorDia = historico.map((c, i) =>
    i === 0 ? 0 : c.paginas - historico[i - 1].paginas
  );

  const chartData = {
    labels: historico.map((c) =>
      new Date(c.data).toLocaleDateString("pt-BR")
    ),
    datasets: [
      {
        label: "Páginas impressas no dia",
        data: paginasPorDia,
        borderWidth: 2,
      },
    ],
  };

  return (
    <main className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{impressora.nome}</h1>
        <p className="text-gray-600 mt-1">
          IP: {impressora.ip} • Criada em:{" "}
          {new Date(impressora.created_at).toLocaleString("pt-BR")}
        </p>
      </div>

      <EditarDescontoBorrao
        id={id}
        descontoInicial={impressora.desconto_borrao ?? 0}
      />

      <Link
        href={`/impressoras/${id}/editar`}
        className="inline-block bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
      >
        Editar Impressora
      </Link>

      <Link
        href={`/impressoras/substituir?origem=${id}`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Substituir esta impressora
      </Link>

      <div className="bg-white p-6 rounded shadow max-w-4xl">
        <LineChart chartData={chartData} />
      </div>

      {historico.length > 0 ? (
        <table className="w-full max-w-4xl border border-gray-300 bg-white rounded shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Total acumulado</th>
              <th className="p-2 border">Páginas no dia</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((c, i) => (
              <tr key={c.data}>
                <td className="p-2 border">
                  {new Date(c.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-2 border">{c.paginas}</td>
                <td className="p-2 border">{paginasPorDia[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum registro de consumo ainda.</p>
      )}
    </main>
  );
}
