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
      valor.replace(".", "").replace(",", ".") // aceita 1.234,56 ou 1234.56
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
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar compra de papel</h1>

      <form
        onSubmit={salvarCompra}
        className="space-y-5 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Data da compra
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Quantidade de folhas
          </label>
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Ex.: 5000"
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valor total (R$)
          </label>
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Ex.: 320,50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fornecedor (opcional)
          </label>
          <input
            type="text"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Ex.: Kalunga, Papelaria X..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Registrar compra"}
        </button>
      </form>
    </main>
  );
}
