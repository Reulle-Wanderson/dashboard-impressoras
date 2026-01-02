"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CadastrarImpressoraConteudo() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [setor, setSetor] = useState("");
  const [descontoBorrao, setDescontoBorrao] = useState<number>(0);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !ip) {
      toast.error("Preencha nome e IP");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("printers").insert({
      nome,
      ip,
      setor,
      desconto_borrao: descontoBorrao,
      status: "ativa",
    });

    if (error) {
      toast.error("Erro ao cadastrar impressora");
      setSalvando(false);
      return;
    }

    toast.success("Impressora cadastrada com sucesso!");
    router.push("/impressoras");
  }

  return (
    <section className="space-y-8 max-w-2xl mx-auto">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Cadastrar impressora
        </h1>
        <p className="text-sm text-gray-500">
          Adicione uma nova impressora ao sistema de monitoramento
        </p>
      </div>

      {/* =========================
          FORMULÁRIO
      ========================= */}
      <form
        onSubmit={salvar}
        className="bg-white p-8 rounded-lg shadow space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Nome da impressora
            </label>
            <input
              className="border rounded px-3 py-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: BROTHER 7055"
            />
          </div>

          {/* IP */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Endereço IP
            </label>
            <input
              className="border rounded px-3 py-2"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Ex.: 192.168.0.50"
            />
          </div>
        </div>

        {/* Setor */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Setor
          </label>
          <input
            className="border rounded px-3 py-2"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            placeholder="Ex.: Financeiro, RH, Logística"
          />
        </div>

        {/* Desconto */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Percentual de borrão (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="border rounded px-3 py-2"
            value={descontoBorrao}
            onChange={(e) =>
              setDescontoBorrao(Number(e.target.value))
            }
          />
          <span className="text-xs text-gray-400 mt-1">
            Usado para desconto de páginas inválidas
          </span>
        </div>

        {/* AÇÕES */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={salvando}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Cadastrar impressora"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/impressoras")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
