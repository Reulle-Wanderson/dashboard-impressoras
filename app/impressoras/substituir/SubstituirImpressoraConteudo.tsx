"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SubstituirImpressoraConteudo() {
  const [impressoras, setImpressoras] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoIp, setNovoIp] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const router = useRouter();

  // ==================================================
  // 🔄 Carregar impressoras ativas
  // ==================================================
  useEffect(() => {
    async function carregarImpressoras() {
      const { data, error } = await supabase
        .from("printers")
        .select("id, nome, ip")
        .eq("status", "ativa")
        .order("nome", { ascending: true });

      if (error) {
        toast.error("Erro ao carregar impressoras");
        return;
      }

      setImpressoras(data ?? []);
    }

    carregarImpressoras();
  }, []);

  // ==================================================
  // 🔎 Validar IPv4
  // ==================================================
  function validarIp(ip: string) {
    const regex =
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

    return regex.test(ip);
  }

  // ==================================================
  // 🔁 Substituir impressora
  // ==================================================
  async function substituirImpressora() {
    if (!selecionada || !novoNome.trim() || !motivo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (novoIp.trim() && !validarIp(novoIp)) {
      toast.error("IP inválido — informe um IPv4 válido");
      return;
    }

    setLoading(true);

    if (novoIp.trim()) {
      const { data: existente } = await supabase
        .from("printers")
        .select("id")
        .eq("ip", novoIp)
        .maybeSingle();

      if (existente) {
        toast.error("Já existe impressora com esse IP");
        setLoading(false);
        return;
      }
    }

    const { error: erroUpdate } = await supabase
      .from("printers")
      .update({ status: "inativa" })
      .eq("id", selecionada);

    if (erroUpdate) {
      toast.error("Erro ao desativar impressora antiga");
      setLoading(false);
      return;
    }

    const { error: erroInsert } = await supabase.from("printers").insert({
      nome: novoNome,
      ip: novoIp.trim() || null,
      rede: !!novoIp.trim(),
      status: "ativa",
    });

    if (erroInsert) {
      toast.error("Erro ao cadastrar nova impressora");
      setLoading(false);
      return;
    }

    toast.success("Impressora substituída com sucesso ✅");
    router.push("/impressoras");
  }

  // ==================================================
  // JSX
  // ==================================================
  return (
    <section className="space-y-8 max-w-2xl mx-auto">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Substituir impressora
        </h1>
        <p className="text-sm text-gray-500">
          Desative uma impressora antiga e cadastre a substituta
        </p>
      </div>

      {/* =========================
          FORMULÁRIO
      ========================= */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Impressora antiga */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Impressora antiga
            </label>
            <Select onValueChange={setSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma impressora" />
              </SelectTrigger>
              <SelectContent>
                {impressoras.map((imp) => (
                  <SelectItem key={imp.id} value={imp.id}>
                    {imp.nome} — {imp.ip ?? "sem IP"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Novo nome */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Nome da nova impressora
            </label>
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex.: BROTHER 7055 (nova)"
            />
          </div>

          {/* Novo IP */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              IP da nova impressora (opcional)
            </label>
            <Input
              value={novoIp}
              onChange={(e) => setNovoIp(e.target.value)}
              placeholder="Ex.: 192.168.1.50"
            />
          </div>

          {/* Motivo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Motivo da substituição
            </label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: defeito no fusor, troca por modelo novo…"
            />
          </div>

          {/* AÇÕES */}
          <div className="flex gap-4 pt-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar substituição"}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/impressoras")}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =========================
          CONFIRMAÇÃO
      ========================= */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar substituição?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            A impressora antiga será desativada e uma nova será cadastrada no
            sistema. Deseja continuar?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={substituirImpressora}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
