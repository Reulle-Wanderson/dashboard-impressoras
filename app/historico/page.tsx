import { supabase } from "@/lib/supabase";
import TabelaHistorico from "@/components/TabelaHistorico";

interface Registro {
  data: string;
  paginas: number;
  printer_id: {
    id: string | null;
    nome: string | null;
  };
}

export default async function Historico() {
  const { data, error } = await supabase
    .from("consumo_impressoras")
    .select(`
      data,
      paginas,
      printer_id (
        id,
        nome
      )
    `)
    .order("data", { ascending: true });

  const registros: Registro[] = (data ?? []).map((r: any) => ({
    data: r.data,
    paginas: r.paginas,
    printer_id: {
      id: r.printer_id?.id ?? null,
      nome: r.printer_id?.nome ?? null,
    },
  }));

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico</h1>
      <TabelaHistorico registros={registros} />
    </main>
  );
}
