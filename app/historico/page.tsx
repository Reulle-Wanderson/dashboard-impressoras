"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function Historico() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);

  // filtros
  const [periodo, setPeriodo] = useState("30");
  const [inicioCustom, setInicioCustom] = useState("");
  const [fimCustom, setFimCustom] = useState("");

  // buscar dados apenas quando filtro mudar
  useEffect(() => {
    async function carregar() {
      setLoading(true);

      let inicio: Date | null = null;
      let fim = new Date();

      if (periodo === "7") {
        inicio = new Date();
        inicio.setDate(inicio.getDate() - 7);
      } else if (periodo === "30") {
        inicio = new Date();
        inicio.setDate(inicio.getDate() - 30);
      } else if (periodo === "mes") {
        const hoje = new Date();
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      } else if (periodo === "custom") {
        if (inicioCustom) inicio = new Date(inicioCustom);
        if (fimCustom) fim = new Date(fimCustom);
      }

      let query = supabase
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

      if (inicio) {
        query = query.gte("data", inicio.toISOString().slice(0, 10));
      }

      if (fim) {
        query = query.lte("data", fim.toISOString().slice(0, 10));
      }

      const { data, error } = await query;

      if (!error && data) {
        const formatado: Registro[] = data.map((r: any) => ({
          data: r.data,
          paginas: r.paginas,
          printer_id: {
            id: r.printer_id?.id ?? null,
            nome: r.printer_id?.nome ?? null,
          },
        }));

        setRegistros(formatado);
      }

      setLoading(false);
    }

    carregar();
  }, [periodo, inicioCustom, fimCustom]);

  const totalPaginas = useMemo(
    () => registros.reduce((s, r) => s + r.paginas, 0),
    [registros]
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Histórico</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">Filtro de período</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="mes">Mês atual</option>
            <option value="custom">Personalizado</option>
          </select>

          {periodo === "custom" && (
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
            {totalPaginas.toLocaleString("pt-BR")}
          </span>{" "}
          páginas
        </p>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded shadow max-h-[500px] overflow-y-auto">
        {loading ? (
          <p className="p-4">Carregando...</p>
        ) : (
          <TabelaHistorico registros={registros} />
        )}
      </div>
    </main>
  );
}
