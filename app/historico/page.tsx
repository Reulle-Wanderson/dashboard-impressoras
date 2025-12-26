"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TabelaHistorico from "@/components/TabelaHistorico";

// ----------------------------------------
// TIPOS
// ----------------------------------------
interface RegistroBruto {
  data: string;
  paginas: number;
  printer_id: {
    id: string;
    nome: string;
  };
}

interface RegistroConsumo {
  data: string;
  paginas: number; // consumo (delta)
  printer: string;
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
        .order("printer_id", { ascending: true })
        .order("data", { ascending: true });

      if (error || !data) {
        setLoading(false);
        return;
      }

      const porImpressora: Record<string, RegistroBruto[]> = {};

      data.forEach((r: RegistroBruto) => {
        const nome = r.printer_id?.nome;
        if (!nome) return;

        if (!porImpressora[nome]) porImpressora[nome] = [];
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
    const set = new Set<string>();
    registros.forEach((r) => set.add(r.printer));
    return Array.from(set).sort();
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

  // ----------------------------------------
  // TOTAL
  // ----------------------------------------
  const totalPeriodo = filtrado.reduce((s, r) => s + r.paginas, 0);

  if (loading) return <div className="p-6">Carregando...</div>;

  // ----------------------------------------
  // JSX
  // ----------------------------------------
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Histórico</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">Filtro de período</h2>

        <div className="flex flex-wrap gap-4">
          <select
            className="border p-2 rounded"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="mes">Mês atual</option>
            <option value="custom">Personalizado</option>
          </select>

          <select
            className="border p-2 rounded"
            value={impressoraSelecionada}
            onChange={(e) => setImpressoraSelecionada(e.target.value)}
          >
            <option value="todas">Todas as impressoras</option>
            {listaImpressoras.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>

          {tipoFiltro === "custom" && (
            <>
              <input
                type="date"
                className="border p-2 rounded"
                value={inicioCustom}
                onChange={(e) => setInicioCustom(e.target.value)}
              />
              <input
                type="date"
                className="border p-2 rounded"
                value={fimCustom}
                onChange={(e) => setFimCustom(e.target.value)}
              />
            </>
          )}
        </div>

        <p className="text-gray-700">
          Total no período:{" "}
          <span className="font-bold">
            {totalPeriodo.toLocaleString("pt-BR")}
          </span>{" "}
          páginas
        </p>
      </div>

      {/* Tabela com rolagem */}
      <div className="bg-white rounded shadow max-h-[520px] overflow-y-auto">
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
    </main>
  );
}
