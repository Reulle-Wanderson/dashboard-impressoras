"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditarImpressoraConteudo({ params }: Props) {
  const router = useRouter();

  const [id, setId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [setor, setSetor] = useState("");
  const [desconto, setDesconto] = useState(0);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // ==================================================
  // 🔓 Resolver params (Next 15+)
  // ==================================================
  useEffect(() => {
    async function resolveParams() {
      const p = await params;
      setId(p.id);
    }
    resolveParams();
  }, [params]);

  // ==================================================
  // 📥 Carregar dados
  // ==================================================
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

  // ==================================================
  // 💾 Salvar alterações
  // ==================================================
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
    router.push(`/impressoras/${id}`);
  }

  if (loading) {
    return <div className="p-6 text-gray-600">Carregando dados...</div>;
  }

  return (
    <section className="space-y-8 max-w-2xl mx-auto">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Editar impressora
        </h1>
        <p className="text-sm text-gray-500">
          Atualize os dados cadastrais da impressora
        </p>
      </div>

      {/* =========================
          FORMULÁRIO
      ========================= */}
      <div className="bg-white p-8 rounded-lg shadow space-y-6">
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
          />
        </div>

        {/* Desconto */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Desconto de borrão (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="border rounded px-3 py-2 w-40"
            value={desconto}
            onChange={(e) => setDesconto(Number(e.target.value))}
          />
        </div>

        {/* AÇÕES */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            onClick={() => router.push(`/impressoras/${id}`)}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </section>
  );
}
