"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TipoCompra = "resma" | "caixa";

export default function NovaCompraPapel() {
  const router = useRouter();

  const [data, setData] = useState("");
  const [tipo, setTipo] = useState<TipoCompra>("resma");
  const [quantidadeUnidades, setQuantidadeUnidades] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CÁLCULO AUTOMÁTICO
  // =========================
  const paginasPorUnidade = tipo === "caixa" ? 5000 : 500;

  const quantidadePaginas = useMemo(() => {
    const q = Number(quantidadeUnidades);
    if (!q || q <= 0) return 0;
    return q * paginasPorUnidade;
  }, [quantidadeUnidades, paginasPorUnidade]);

  // =========================
  // SALVAR
  // =========================
  async function salvarCompra(e: React.FormEvent) {
    e.preventDefault();

    if (!data || !quantidadeUnidades || !valor) {
      toast.error("Preencha data, tipo, quantidade e valor.");
      return;
    }

    if (quantidadePaginas <= 0) {
      toast.error("Quantidade inválida.");
      return;
    }

    const valorNumerico = Number(
      valor.replace(".", "").replace(",", ".")
    );

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error("Valor inválido.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("compras_papel").insert({
      data,
      quantidade_folhas: quantidadePaginas,
      valor_total: valorNumerico,
      fornecedor: fornecedor || null,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Erro ao registrar compra", {
        description: "Verifique os dados e tente novamente.",
        className: "border-red-200 bg-red-50 text-red-900",
      });

      return;
    }

    toast.success("Compra registrada com sucesso", {
      description: "Os dados já foram incluídos no financeiro.",
      className: "border-blue-200 bg-blue-50 text-blue-900",
    });
    router.push("/financeiro");
  }

  return (
    <section className="space-y-8 max-w-2xl mx-auto">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Registrar compra de papel
        </h1>
        <p className="text-sm text-gray-500">
          O sistema calcula automaticamente a quantidade de páginas
        </p>
      </div>

      {/* =========================
          FORMULÁRIO
      ========================= */}
      <form
        onSubmit={salvarCompra}
        className="bg-white p-8 rounded-lg shadow space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Data da compra
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          {/* Tipo */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Tipo de compra
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCompra)}
              className="border rounded px-3 py-2"
            >
              <option value="resma">Resma (500 páginas)</option>
              <option value="caixa">Caixa (5000 páginas)</option>
            </select>
          </div>

          {/* Quantidade */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Quantidade ({tipo === "caixa" ? "caixas" : "resmas"})
            </label>
            <input
              type="number"
              min={1}
              value={quantidadeUnidades}
              onChange={(e) => setQuantidadeUnidades(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Ex.: 2"
            />
          </div>

          {/* Total calculado */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Total de páginas (calculado)
            </label>
            <input
              type="text"
              value={quantidadePaginas.toLocaleString("pt-BR")}
              disabled
              className="border rounded px-3 py-2 bg-gray-100 text-gray-700"
            />
          </div>
        </div>

        {/* Valor */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Valor total (R$)
          </label>
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="border rounded px-3 py-2"
            placeholder="Ex.: 320,50"
          />
        </div>

        {/* Fornecedor */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Fornecedor (opcional)
          </label>
          <input
            type="text"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* AÇÕES */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Registrar compra"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/financeiro")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
