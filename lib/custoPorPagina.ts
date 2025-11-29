import { supabase } from "@/lib/supabase";

export async function getCustoPorPagina(mes: string) {
  const { data, error } = await supabase
    .from("compras_papel")
    .select("quantidade_folhas, valor_total")
    .gte("data", `${mes}-01`)
    .lte("data", `${mes}-31`);

  if (error || !data || data.length === 0) return 0;

  const totalFolhas = data.reduce((sum, compra) => sum + compra.quantidade_folhas, 0);
  const totalValor = data.reduce((sum, compra) => sum + Number(compra.valor_total), 0);

  return totalValor / totalFolhas; // ✅ custo real por página
}
