"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditarImpressora({ params }: Props) {
  const router = useRouter();

  const [id, setId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [setor, setSetor] = useState("");
  const [desconto, setDesconto] = useState(0);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // 🔥 PEGAR O ID CORRETAMENTE DO NEXT 15/16
  useEffect(() => {
    async function resolveParams() {
      const p = await params; // <- OBRIGATÓRIO
      setId(p.id);
    }

    resolveParams();
  }, [params]);

  // 🔥 CARREGAR OS DADOS DA IMPRESSORA
  useEffect(() => {
    if (!id) return;

    async function carregar() {
      const { data, error } = await supabase
        .from("printers")
        .select("*")
        .eq("id", id)
        .single();

      if (!data || error) {
        toast.error("Impressora não encontrada");
        router.push("/impressoras");
        return;
      }

      setNome(data.nome ?? "");
      setIp(data.ip ?? "");
      setSetor(data.setor ?? "");
      setDesconto(data.desconto_borrao ?? 0);


      setLoading(false);
    }

    carregar();
  }, [id, router]);

  // 🔥 SALVAR ALTERAÇÕES
  async function salvar() {
    if (!id) return;

    setSalvando(true);

    const { error } = await supabase
      .from("printers")
      .update({
        nome,
        ip,
        setor,
        desconto_borrao: desconto,
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar alterações");
      setSalvando(false);
      return;
    }

    toast.success("Impressora atualizada com sucesso!");
    router.push("/impressoras");
  }

  if (loading) return <p className="p-8">Carregando...</p>;

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Impressora</h1>

      <div className="space-y-4 bg-white p-6 rounded shadow">

        <div>
          <label>Nome</label>
          <input
            className="w-full p-2 border rounded"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label>IP</label>
          <input
            className="w-full p-2 border rounded"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
        </div>

        <div>
          <label>Setor</label>
          <input
            className="w-full p-2 border rounded"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
          />
        </div>

        <div>
          <label>Desconto de borrão (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full p-2 border rounded"
            value={desconto}
            onChange={(e) => setDesconto(Number(e.target.value))}
          />
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </main>
  );
}
