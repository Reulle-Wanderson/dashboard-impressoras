"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function NovaImpressora() {
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
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Impressora</h1>

      <form onSubmit={salvar} className="space-y-5 bg-white p-6 rounded shadow">
        
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            className="border rounded p-2 w-full"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">IP</label>
          <input
            className="border rounded p-2 w-full"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Setor</label>
          <input
            className="border rounded p-2 w-full"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Percentual de borrão (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="border rounded p-2 w-full"
            value={descontoBorrao}
            onChange={(e) => setDescontoBorrao(Number(e.target.value))}
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Cadastrar"}
        </button>

      </form>
    </main>
  );
}
