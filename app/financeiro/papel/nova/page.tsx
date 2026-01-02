"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NovaCompraPapel() {
  const [data, setData] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function salvarCompra(e: React.FormEvent) {
    e.preventDefault();

    if (!data || !quantidade || !valor) {
      toast.error("Preencha data, quantidade e valor.");
      return;
    }

    const valorNumerico = Number(
      valor.replace(".", "").replace(",", ".")
    );

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error("Valor inválido.");
      return;
    }

    if (Number(quantidade) <= 0) {
      toast.error("Quantidade deve ser maior que zero.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("compras_papel").insert({
      data,
      quantidade_folhas: Number(quantidade),
      valor_total: valorNumerico,
      fornecedor: fornecedor || null,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Erro ao registrar compra.");
      return;
    }

    toast.success("Compra registrada com sucesso ✅");
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
          Cadastre uma nova compra para cálculo de custo por página
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

          {/* Quantidade */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Quantidade de folhas
            </label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Ex.: 5000"
              min={1}
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
            placeholder="Ex.: Kalunga, Papelaria X..."
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
