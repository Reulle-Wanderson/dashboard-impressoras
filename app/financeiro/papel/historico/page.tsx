"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// =======================
// TIPOS
// =======================
interface CompraPapel {
  id: number;
  data: string;
  quantidade_folhas: number;
  valor_total: number;
  fornecedor: string | null;
}

// =======================
// COMPONENTE
// =======================
export default function HistoricoCompraPapelPage() {
  const [dados, setDados] = useState<CompraPapel[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [periodo, setPeriodo] = useState("30");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState<string[]>([]);

  // =======================
  // BUSCAR DADOS
  // =======================
  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("compras_papel")
        .select("*")
        .order("data", { ascending: false });

      if (!error) {
        setDados(data ?? []);
      }

      setLoading(false);
    }

    carregar();
  }, []);

  // =======================
  // FORNECEDORES (SEM DUPLICAR)
  // =======================
  const fornecedores = useMemo(() => {
    const mapa = new Map<string, string>();

    dados.forEach((d) => {
      if (!d.fornecedor) return;
      const normalizado = d.fornecedor.trim().toUpperCase();
      if (!mapa.has(normalizado)) {
        mapa.set(normalizado, d.fornecedor.trim());
      }
    });

    return Array.from(mapa.values()).sort();
  }, [dados]);

  function toggleFornecedor(nome: string) {
    setFornecedoresSelecionados((prev) =>
      prev.includes(nome)
        ? prev.filter((f) => f !== nome)
        : [...prev, nome]
    );
  }

  // =======================
  // FILTRO
  // =======================
  const filtrados = useMemo(() => {
    let inicio: Date | null = null;
    let fim = new Date();

    if (periodo === "7") {
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 7);
    }

    if (periodo === "30") {
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 30);
    }

    if (periodo === "custom") {
      if (dataInicio) inicio = new Date(dataInicio);
      if (dataFim) fim = new Date(dataFim);
    }

    return dados.filter((d) => {
      const dataCompra = new Date(d.data);

      const passaPeriodo =
        (!inicio || dataCompra >= inicio) && dataCompra <= fim;

      const passaFornecedor =
        fornecedoresSelecionados.length === 0 ||
        fornecedoresSelecionados.includes(d.fornecedor?.trim() ?? "");

      return passaPeriodo && passaFornecedor;
    });
  }, [dados, periodo, dataInicio, dataFim, fornecedoresSelecionados]);

  const totalPaginas = filtrados.reduce((s, d) => s + d.quantidade_folhas, 0);
  const totalValor = filtrados.reduce((s, d) => s + d.valor_total, 0);

  // =======================
  // EXPORTAR EXCEL
  function exportarExcel() {
  const headers = ["Data", "Páginas", "Valor (R$)", "Fornecedor"];

  const rows = filtrados.map((d) => [
    new Date(d.data).toLocaleDateString("pt-BR"),
    d.quantidade_folhas,
    d.valor_total.toFixed(2),
    d.fornecedor ?? "",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((r) => r.join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "historico-compras-papel.csv";
  link.click();

  URL.revokeObjectURL(url);
}

  // =======================
  // EXPORTAR PDF
  // =======================
  function exportarPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    const img = new Image();
    img.src = "/Logo_Mega1.png";

    img.onload = () => {
      doc.addImage(img, "PNG", 20, 11, 35, 32);

      doc.setFontSize(27);
      doc.text("Histórico de Compras", pageWidth / 2, 27, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Período: ${periodo === "30"
          ? "Últimos 30 dias"
          : periodo === "7"
            ? "Últimos 7 dias"
            : "Personalizado"
        }`,
        pageWidth / 2,
        33,
        { align: "center" }
      );

      (autoTable as any)(doc, {
        startY: 50,
        head: [["Data", "Páginas", "Valor (R$)", "Fornecedor"]],
        body: filtrados.map((d) => [
          new Date(d.data).toLocaleDateString("pt-BR"),
          d.quantidade_folhas.toLocaleString("pt-BR"),
          d.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
          d.fornecedor ?? "-",
        ]),
        styles: { fontSize: 9, cellPadding: 4, valign: "middle" },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 30 },
          1: { halign: "right", cellWidth: 30 },
          2: { halign: "right", cellWidth: 45 },
          3: { halign: "left", cellWidth: 70 },
        },
        didParseCell(data: any) {
          if (data.section === "head") {
            if (data.column.index === 0) data.cell.styles.halign = "center";
            if (data.column.index === 1) data.cell.styles.halign = "right";
            if (data.column.index === 2) data.cell.styles.halign = "right";
            if (data.column.index === 3) data.cell.styles.halign = "left";
          }
        },
        margin: { left: 18, right: 20 },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 260;

      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Total de páginas: ${totalPaginas.toLocaleString(
          "pt-BR"
        )} | Total gasto: ${totalValor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`,
        pageWidth / 2,
        finalY + 10,
        { align: "center" }
      );

      doc.save("historico-compras-papel.pdf");
    };
  }

  if (loading) {
    return <div className="p-6 text-gray-600">Carregando...</div>;
  }

  // =======================
  // JSX
  // =======================
  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-800">
      Histórico de compras de papel
    </h1>
    <p className="text-sm text-gray-500">
      Registro detalhado de aquisições
    </p>
  </div>

  <div className="flex gap-2">
    <button
      onClick={exportarPDF}
      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition whitespace-nowrap"
    >
      Exportar PDF
    </button>

    <button
      onClick={exportarExcel}
      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition whitespace-nowrap"
    >
      Exportar Excel
    </button>
  </div>
</div>


      {/* FILTROS MINIMALISTAS */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {periodo === "custom" && (
            <>
              <div>
                <label className="text-xs text-gray-500">Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div className="relative">
            <label className="text-xs text-gray-500">Fornecedor</label>
            <details className="relative">
              <summary className="cursor-pointer border rounded-lg px-3 py-2 text-sm list-none">
                {fornecedoresSelecionados.length === 0
                  ? "Todos"
                  : `${fornecedoresSelecionados.length} selecionado(s)`}
              </summary>
              <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow p-3 space-y-2 max-h-48 overflow-y-auto">
                {fornecedores.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={fornecedoresSelecionados.includes(f)}
                      onChange={() => toggleFornecedor(f)}
                      className="accent-blue-600"
                    />
                    {f}
                  </label>
                ))}
              </div>
            </details>
          </div>


        </div>

        <div className="text-sm text-gray-700">
          Total:{" "}
          <strong>{totalPaginas.toLocaleString("pt-BR")}</strong> páginas —{" "}
          <strong>
            {totalValor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-center">Data</th>
              <th className="p-3 text-right">Páginas</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-left">Fornecedor</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-center">
                  {new Date(d.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3 text-right">
                  {d.quantidade_folhas.toLocaleString("pt-BR")}
                </td>
                <td className="p-3 text-right">
                  {d.valor_total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="p-3 text-left">{d.fornecedor ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
