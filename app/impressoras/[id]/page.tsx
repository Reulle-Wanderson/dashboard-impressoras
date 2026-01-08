"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LineChart from "@/components/LineChart";
import TabelaHistorico from "@/components/TabelaHistorico";
import { EditarDescontoBorrao } from "./EditarDescontoBorrao";

// ----------------------------------------
// TIPOS
// ----------------------------------------
interface ConsumoRegistro {
  data: string;
  paginas: number;
}

interface Impressora {
  id: string;
  nome: string;
  ip: string;
  setor: string | null;
  desconto_borrao: number | null;
  created_at: string;
}

// ----------------------------------------
// FUNÇÃO — Cálculo de consumo diário
// ----------------------------------------
function calcularConsumoDiario(registros: ConsumoRegistro[]) {
  if (!registros.length) return [];

  const ordenado = [...registros].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  const resultado: {
    data: string;
    paginas: number;
    consumo: number;
  }[] = [];

  for (let i = 1; i < ordenado.length; i++) {
    const anterior = ordenado[i - 1];
    const atual = ordenado[i];

    const delta = atual.paginas - anterior.paginas;
    const consumo = delta > 0 ? delta : 0;

    resultado.push({
      data: atual.data,
      paginas: atual.paginas,
      consumo,
    });
  }

  return resultado;
}

// ----------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------
export default function ImpressoraDetalhes({ params }: { params: any }) {
  const [impressora, setImpressora] = useState<Impressora | null>(null);
  const [historico, setHistorico] = useState<ConsumoRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [tipoFiltro, setTipoFiltro] = useState("30");
  const [inicioCustom, setInicioCustom] = useState("");
  const [fimCustom, setFimCustom] = useState("");

  // 🔒 detectar ambiente local
  const podeSalvarBorrao =
  process.env.NEXT_PUBLIC_SHOW_BORRAO_SAVE === "true";

  // ----------------------------------------
  // BUSCAR DADOS
  // ----------------------------------------
  useEffect(() => {
    async function carregar() {
      const { id } = await params;

      const { data: imp } = await supabase
        .from("printers")
        .select("*")
        .eq("id", id)
        .single();

      const { data: cons } = await supabase
        .from("consumo_impressoras")
        .select("data, paginas")
        .eq("printer_id", id)
        .order("data", { ascending: true });

      setImpressora(imp);
      setHistorico(cons ?? []);
      setLoading(false);
    }

    carregar();
  }, [params]);

  // ----------------------------------------
  // FILTRO
  // ----------------------------------------
  const filtrado = useMemo(() => {
    let inicio: Date | null = null;
    let fim = new Date();

    if (tipoFiltro === "7") {
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 7);
    } else if (tipoFiltro === "30") {
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 30);
    } else if (tipoFiltro === "mes") {
      const hoje = new Date();
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    } else if (tipoFiltro === "custom") {
      if (inicioCustom) inicio = new Date(inicioCustom);
      if (fimCustom) fim = new Date(fimCustom);
    }

    return historico.filter((r) => {
      const dataR = new Date(r.data);
      return (!inicio || dataR >= inicio) && dataR <= fim;
    });
  }, [historico, tipoFiltro, inicioCustom, fimCustom]);

  const diario = useMemo(
    () => calcularConsumoDiario(filtrado),
    [filtrado]
  );

  const totalPeriodo = diario.reduce((s, d) => s + d.consumo, 0);

  const chartData = {
    labels: diario.map((d) =>
      new Date(d.data).toLocaleDateString("pt-BR")
    ),
    datasets: [
      {
        label: "Consumo diário",
        data: diario.map((d) => d.consumo),
        borderWidth: 2,
        tension: 0.35,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.25)",
        pointRadius: 3,
      },
    ],
  };

  if (loading || !impressora) {
    return <div className="p-6 text-gray-600">Carregando impressora...</div>;
  }

  // ----------------------------------------
  // JSX
  // ----------------------------------------
  return (
    <section className="space-y-8">
      {/* CABEÇALHO + AÇÕES */}
      <div className="bg-white p-6 rounded-lg shadow space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {impressora.nome}
            </h1>
            <p className="text-sm text-gray-500">
              IP: {impressora.ip} • Criada em{" "}
              {new Date(impressora.created_at).toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/impressoras/${impressora.id}/editar`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Editar
            </Link>

            <Link
              href={`/impressoras/substituir?origem=${impressora.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Substituir
            </Link>
          </div>
        </div>

        {/* BORRÃO — salvar só no localhost */}
        <EditarDescontoBorrao
          id={impressora.id}
          descontoInicial={impressora.desconto_borrao ?? 0}
          esconderSalvar={!podeSalvarBorrao}
        />
      </div>

      {/* FILTRO + GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FILTROS */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-semibold text-gray-700">
            Filtro de período
          </h2>

          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Período</label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="mes">Mês atual</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {tipoFiltro === "custom" && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">
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
                  <label className="text-sm text-gray-600">
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

          <div className="pt-2 text-gray-700">
            Total no período:
            <div className="text-2xl font-bold text-blue-700">
              {totalPeriodo.toLocaleString("pt-BR")}
            </div>
            <span className="text-sm">páginas</span>
          </div>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <LineChart chartData={chartData} />
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow max-h-105 overflow-y-auto">
        <TabelaHistorico
          registros={diario.map((d) => ({
            data: d.data,
            paginas: d.consumo,
            printer_id: {
              id: impressora.id,
              nome: impressora.nome,
            },
          }))}
        />
      </div>
    </section>
  );
}
