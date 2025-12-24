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

  const resultado = [];

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

  // Filtros
  const [tipoFiltro, setTipoFiltro] = useState("30"); // padrão: 30 dias
  const [inicioCustom, setInicioCustom] = useState("");
  const [fimCustom, setFimCustom] = useState("");

  // ----------------------------------------
  // BUSCAR DADOS INICIAIS
  // ----------------------------------------
  useEffect(() => {
    async function carregar() {
      const { id } = await params;

      // Buscar impressora
      const { data: imp } = await supabase
        .from("printers")
        .select("*")
        .eq("id", id)
        .single();

      setImpressora(imp);

      // Buscar histórico completo
      const { data: cons } = await supabase
        .from("consumo_impressoras")
        .select("data, paginas")
        .eq("printer_id", id)
        .order("data", { ascending: true });

      setHistorico(cons ?? []);
      setLoading(false);
    }

    carregar();
  }, [params]);

  // ----------------------------------------
  // PROCESSAR FILTROS
  // ----------------------------------------
  const filtrado = useMemo(() => {
    if (!historico.length) return [];

    let inicio = null;
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

  // Cálculo diário
  const diario = useMemo(() => calcularConsumoDiario(filtrado), [filtrado]);

  // Totais
  const totalPeriodo = diario.reduce((s, d) => s + d.consumo, 0);

  // Dados para gráfico
  const chartData = {
    labels: diario.map((d) =>
      new Date(d.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    ),
    datasets: [
      {
        label: "Consumo diário",
        data: diario.map((d) => d.consumo),
        borderWidth: 2,
        tension: 0.3,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.25)",
        pointRadius: 4,
      },
    ],
  };

  if (loading || !impressora) return <div className="p-8">Carregando...</div>;

  // ----------------------------------------
  // JSX FINAL
  // ----------------------------------------
  return (
    <main className="p-8 space-y-10">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">{impressora.nome}</h1>
        <p className="text-gray-600 mt-1">
          IP: {impressora.ip} • Criada em{" "}
          {new Date(impressora.created_at).toLocaleString("pt-BR")}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold text-lg">Filtro de período</h2>

        <div className="flex flex-wrap gap-4">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="mes">Mês atual</option>
            <option value="custom">Personalizado</option>
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
          <span className="font-bold">{totalPeriodo.toLocaleString("pt-BR")}</span>{" "}
          páginas
        </p>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded shadow">
        <LineChart chartData={chartData} />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded shadow max-h-[420px] overflow-y-auto">
        <TabelaHistorico
          registros={diario.map((d) => ({
            data: d.data,
            paginas: d.consumo,
            printer_id: { id: impressora.id, nome: impressora.nome },
          }))}
        />
      </div>



      {/* Borrão */}
      <EditarDescontoBorrao
        id={impressora.id}
        descontoInicial={impressora.desconto_borrao ?? 0}
      />

      {/* Ações */}
      <div className="flex gap-4">
        <Link
          href={`/impressoras/${impressora.id}/editar`}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          Editar Impressora
        </Link>
        <Link
          href={`/impressoras/substituir?origem=${impressora.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Substituir Impressora
        </Link>
      </div>
    </main>
  );
}
