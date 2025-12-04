import Link from "next/link";
import LineChart from "@/components/LineChart";
import { supabase } from "@/lib/supabase";
import { EditarDescontoBorrao } from "./EditarDescontoBorrao";
import FiltroPeriodo from "./FiltroPeriodo"; // <-- novo import

interface ConsumoRegistro {
  data: string;
  paginas: number;
}

export default async function ImpressoraDetalhes({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Buscar impressora
  const { data: impressora } = await supabase
    .from("printers")
    .select("*")
    .eq("id", id)
    .single();

  if (!impressora) {
    return <div className="p-8 text-red-600">Impressora não encontrada ❌</div>;
  }

  // Buscar histórico completo
  const { data: consumos } = await supabase
    .from("consumo_impressoras")
    .select("data, paginas")
    .eq("printer_id", id)
    .order("data", { ascending: true });

  const historico: ConsumoRegistro[] = consumos ?? [];

  return (
    <main className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{impressora.nome}</h1>
        <p className="text-gray-600 mt-1">
          IP: {impressora.ip} • Criada em:{" "}
          {new Date(impressora.created_at).toLocaleString("pt-BR")}
        </p>
      </div>

      {/* FILTRO DE PERÍODO (agora em Componente Client separado) */}
      <FiltroPeriodo historico={historico} />

      <EditarDescontoBorrao
        id={id}
        descontoInicial={impressora.desconto_borrao ?? 0}
      />

      <div className="flex gap-4">
        <Link
          href={`/impressoras/${id}/editar`}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          Editar Impressora
        </Link>

        <Link
          href={`/impressoras/substituir?origem=${id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Substituir esta impressora
        </Link>
      </div>
    </main>
  );
}
