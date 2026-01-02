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

    toast.success("Percentual de borrão atualizado");
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow max-w-lg space-y-4">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          Percentual de borrão
        </h3>
        <p className="text-sm text-gray-500">
          Define o desconto aplicado às páginas inválidas
        </p>
      </div>

      {/* =========================
          CONTROLE
      ========================= */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Percentual (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            className="border rounded px-3 py-2 w-32"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
          />
        </div>

        <button
          onClick={salvar}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </section>
  );
}
