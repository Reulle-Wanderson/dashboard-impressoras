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

  // 🔄 carregar impressoras ativas
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

  // 🔎 validar IPv4
  function validarIp(ip: string) {
    const regex =
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

    return regex.test(ip);
  }

  // 🔁 substituir impressora
  async function substituirImpressora() {
    if (!selecionada || !novoNome.trim() || !motivo.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // validar IP apenas se informado
    if (novoIp.trim() && !validarIp(novoIp)) {
      toast.error("IP inválido — informe um IPv4 válido");
      return;
    }

    setLoading(true);

    // impedir IP duplicado apenas se IP foi informado
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

    // desativar impressora antiga
    const { error: erroUpdate } = await supabase
      .from("printers")
      .update({ status: "inativa" })
      .eq("id", selecionada);

    if (erroUpdate) {
      toast.error("Erro ao desativar impressora antiga");
      setLoading(false);
      return;
    }

    // cadastrar nova impressora
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

  return (
    <main className="p-8 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-6 pt-6">
          <h1 className="text-2xl font-bold">Substituir Impressora</h1>

          {/* impressora antiga */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Impressora antiga</label>
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

          {/* novo nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da nova impressora</label>
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </div>

          {/* novo IP */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              IP da nova impressora (opcional)
            </label>
            <Input
              value={novoIp}
              onChange={(e) => setNovoIp(e.target.value)}
              placeholder="Ex.: 192.168.1.50"
            />
          </div>

          {/* motivo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo da substituição</label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: defeito no fusor, baixo rendimento do toner..."
            />
          </div>

          {/* botão */}
          <Button
            className="w-full"
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
          >
            {loading ? "Processando..." : "Confirmar substituição"}
          </Button>
        </CardContent>
      </Card>

      {/* confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar substituição?</DialogTitle>
          </DialogHeader>

          <p>
            A impressora antiga será desativada e uma nova será cadastrada no
            sistema. Deseja continuar?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={substituirImpressora}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
