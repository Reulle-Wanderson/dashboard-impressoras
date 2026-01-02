"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TabelaHistorico from "@/components/TabelaHistorico";

// ----------------------------------------
// TIPOS
// ----------------------------------------
type PrinterJoin =
  | { id: string; nome: string }
  | { id: string; nome: string }[]
  | null;

interface RegistroSupabase {
  data: string;
  paginas: number;
  printer_id: PrinterJoin;
}

interface RegistroConsumo {
  data: string;
  paginas: number;
  printer: string;
}

// ----------------------------------------
// HELPERS
// ----------------------------------------
function extrairNomeImpressora(printer: PrinterJoin): string | null {
  if (!printer) return null;

  if (Array.isArray(printer)) {
    return printer[0]?.nome ?? null;
  }

  return printer.nome ?? null;
}

// ----------------------------------------
// COMPONENTE
// ----------------------------------------
export default function HistoricoPage() {
  const [registros, setRegistros] = useState<RegistroConsumo[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [tipoFiltro, setTipoFiltro] = useState("30");
  const [inicioCustom, setInicioCustom] = useState("");
  const [fimCustom, setFimCustom] = useState("");
  const [impressoraSelecionada, setImpressoraSelecionada] = useState("todas");

  // ----------------------------------------
  // BUSCAR + CALCULAR DELTA
  // ----------------------------------------
  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("consumo_impressoras")
        .select(
          `
          data,
          paginas,
          printer_id (
            id,
            nome
          )
        `
        )
        .order("data", { ascending: true });

      if (error || !data) {
        setLoading(false);
        return;
      }

      const porImpressora: Record<string, RegistroSupabase[]> = {};

      (data as RegistroSupabase[]).forEach((r) => {
        const nome = extrairNomeImpressora(r.printer_id);
        if (!nome) return;

        if (!porImpressora[nome]) {
          porImpressora[nome] = [];
        }

        porImpressora[nome].push(r);
      });

      const consumoFinal: RegistroConsumo[] = [];

      Object.entries(porImpressora).forEach(([printer, regs]) => {
        for (let i = 1; i < regs.length; i++) {
          const atual = regs[i];
          const anterior = regs[i - 1];

          const delta = atual.paginas - anterior.paginas;

          if (delta > 0) {
            consumoFinal.push({
              data: atual.data,
              paginas: delta,
              printer,
            });
          }
        }
      });

      setRegistros(consumoFinal);
      setLoading(false);
    }

    carregar();
  }, []);

  // ----------------------------------------
  // LISTA DE IMPRESSORAS
  // ----------------------------------------
  const listaImpressoras = useMemo(() => {
    return Array.from(new Set(registros.map((r) => r.printer))).sort();
  }, [registros]);

  // ----------------------------------------
  // FILTRO
  // ----------------------------------------
  const filtrado = useMemo(() => {
    let inicio: Date | null = null;
    let fim = new Date();

    if (tipoFiltro === "7") {
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 7);
    }

    if (tipoFiltro === "30") {
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 30);
    }

    if (tipoFiltro === "mes") {
      const hoje = new Date();
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    if (tipoFiltro === "custom") {
      if (inicioCustom) inicio = new Date(inicioCustom);
      if (fimCustom) fim = new Date(fimCustom);
    }

    return registros.filter((r) => {
      const dataR = new Date(r.data);

      const passaPeriodo =
        (!inicio || dataR >= inicio) && dataR <= fim;

      const passaImpressora =
        impressoraSelecionada === "todas" ||
        r.printer === impressoraSelecionada;

      return passaPeriodo && passaImpressora;
    });
  }, [
    registros,
    tipoFiltro,
    inicioCustom,
    fimCustom,
    impressoraSelecionada,
  ]);

  const totalPeriodo = filtrado.reduce((s, r) => s + r.paginas, 0);

  if (loading) {
    return <div className="p-6 text-gray-600">Carregando histórico...</div>;
  }

  // ----------------------------------------
  // JSX
  // ----------------------------------------
  return (
    <section className="space-y-8">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Histórico de consumo
        </h1>
        <p className="text-sm text-gray-500">
          Detalhamento diário de páginas impressas
        </p>
      </div>

      {/* =========================
          FILTROS
      ========================= */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">
              Período
            </label>
            <select
              className="border rounded px-3 py-2"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="mes">Mês atual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">
              Impressora
            </label>
            <select
              className="border rounded px-3 py-2 min-w-[220px]"
              value={impressoraSelecionada}
              onChange={(e) =>
                setImpressoraSelecionada(e.target.value)
              }
            >
              <option value="todas">Todas as impressoras</option>
              {listaImpressoras.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          {tipoFiltro === "custom" && (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">
                  Data início
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  value={inicioCustom}
                  onChange={(e) => setInicioCustom(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">
                  Data fim
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  value={fimCustom}
                  onChange={(e) => setFimCustom(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="text-gray-700">
          Total no período:{" "}
          <strong className="text-blue-700">
            {totalPeriodo.toLocaleString("pt-BR")}
          </strong>{" "}
          páginas
        </div>
      </div>

      {/* =========================
          TABELA
      ========================= */}
      <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[520px]">
        <TabelaHistorico
          registros={filtrado.map((r) => ({
            data: r.data,
            paginas: r.paginas,
            printer_id: {
              id: null,
              nome: r.printer,
            },
          }))}
        />
      </div>
    </section>
  );
}
