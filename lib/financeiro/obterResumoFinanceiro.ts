import { supabase } from "@/lib/supabase";
import { normalizarRegistros } from "@/lib/financeiro/normalizarRegistros";
import { calcularTotalPaginasPorMes } from "@/lib/financeiro/calcularTotalPaginas";

// ======================================================================
//  OBTÉM RESUMO FINANCEIRO (MODELO PROFISSIONAL)
// ======================================================================
export async function obterResumoFinanceiro() {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // ======================================================================
  // 1️⃣ COMPRAS DE PAPEL DO MÊS
  // ======================================================================
  const { data: compras } = await supabase
    .from("compras_papel")
    .select("quantidade_folhas, valor_total")
    .gte("data", inicioMes);

  const totalFolhas =
    compras?.reduce((s, c) => s + c.quantidade_folhas, 0) ?? 0;

  const totalGasto =
    compras?.reduce((s, c) => s + Number(c.valor_total), 0) ?? 0;

  const custoPorFolha = totalFolhas > 0 ? totalGasto / totalFolhas : 0;

  // ======================================================================
  // 2️⃣ REGISTROS DE CONSUMO DENTRO DO MÊS
  // ======================================================================
  const { data: registrosMes } = await supabase
    .from("consumo_impressoras")
    .select(`
      printer_id,
      data,
      paginas,
      printers (
        nome,
        setor,
        desconto_borrao
      )
    `)
    .gte("data", inicioMes)
    .order("printer_id")
    .order("data");

  const registrosNormalizados = normalizarRegistros(registrosMes ?? []);

  // ======================================================================
  // 3️⃣ OBTÉM O ÚLTIMO REGISTRO *ANTES* DO MÊS (referência SNMP)
  // ======================================================================
  const { data: registrosAntes } = await supabase
    .from("consumo_impressoras")
    .select("printer_id, paginas, data")
    .lt("data", inicioMes)
    .order("data", { ascending: false });

  const referenciaMesAnterior = new Map<string, number>();

  for (const r of registrosAntes ?? []) {
    if (!referenciaMesAnterior.has(r.printer_id)) {
      referenciaMesAnterior.set(r.printer_id, r.paginas);
    }
  }

  // ======================================================================
  // 4️⃣ CALCULA CONSUMO POR IMPRESSORA
  // ======================================================================
  const rankingImpressoras = [...registrosNormalizados.entries()].map(
    ([id, info]) => {
      const referencia = referenciaMesAnterior.get(id) ?? null;

      const paginasMes = calcularTotalPaginasPorMes(
        info.registros,
        referencia
      );

      const paginasValidas = Math.max(
        Math.floor(paginasMes * (1 - info.desconto / 100)),
        0
      );

      const custoMes = paginasValidas * custoPorFolha;

      return {
        id,
        nome: info.nome,
        setor: info.setor,
        desconto: info.desconto,
        paginasMes,
        paginasValidas,
        custoMes,
      };
    }
  );

  // ======================================================================
  // 5️⃣ AGRUPA POR SETOR (CORRIGIDO)
  // ======================================================================
  const porSetor = new Map<
    string,
    { paginas: number; paginasValidas: number; custo: number }
  >();

  rankingImpressoras.forEach((imp) => {
    const setor = imp.setor ?? "Sem setor";

    const atual = porSetor.get(setor) ?? {
      paginas: 0,
      paginasValidas: 0,
      custo: 0,
    };

    atual.paginas += imp.paginasMes;
    atual.paginasValidas += imp.paginasValidas;
    atual.custo += imp.custoMes;

    porSetor.set(setor, atual);
  });

  // ✅ Agora sim: ordenar apenas UMA vez, fora do loop
  rankingImpressoras.sort((a, b) => b.paginasMes - a.paginasMes);

  // ======================================================================
  // 6️⃣ RETORNO FINAL
  // ======================================================================
  return {
    custoPorFolha,
    totalImpressoMes: rankingImpressoras.reduce(
      (s, i) => s + i.paginasMes,
      0
    ),
    totalCustoReal: rankingImpressoras.reduce((s, i) => s + i.custoMes, 0),
    rankingImpressoras,
    rankingSetores: [...porSetor.entries()].map(([setor, dados]) => ({
      setor,
      paginas: dados.paginas,
      paginasValidas: dados.paginasValidas,
      custo: dados.custo,
    })),
  };
}
