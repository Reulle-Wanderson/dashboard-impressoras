"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function EditarDescontoBorrao({
  id,
  descontoInicial,
}: {
  id: string;
  descontoInicial: number;
}) {
  const [valor, setValor] = useState(descontoInicial);
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (valor < 0 || valor > 100) {
      toast.error("O desconto deve estar entre 0% e 100%");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("printers")
      .update({ desconto_borrao: valor })
      .eq("id", id);

    setLoading(false);

    if (error) {
      toast.error("Erro ao atualizar percentual");
      return;
    }

    toast.success("Percentual atualizado");
  }

  return (
    <div className="bg-white border p-4 rounded shadow max-w-md">
      <h3 className="font-semibold text-lg mb-2">
        Percentual de borrão da impressora
      </h3>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          className="border rounded p-2 w-24"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
        />
        <span className="text-gray-600">%</span>

        <button
          onClick={salvar}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
