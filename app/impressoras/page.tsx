import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  Th,
  Td,
} from "@/components/ui/table";

export default async function ListaImpressoras() {
  const { data: printers, error } = await supabase
    .from("printers")
    .select("id, nome, ip, rede, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return (
      <div className="p-8 text-red-600">
        Erro ao carregar impressoras ❌
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* =========================
          TÍTULO + AÇÃO
      ========================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Impressoras monitoradas
          </h1>
          <p className="text-sm text-gray-500">
            Lista de impressoras cadastradas no sistema
          </p>
        </div>

        <Link
          href="/impressoras/nova"
          className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition w-fit"
        >
          Cadastrar impressora
        </Link>
      </div>

      {/* =========================
          TABELA
      ========================= */}
      {printers?.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-gray-600">
          Nenhuma impressora cadastrada.
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <Th>Nome</Th>
              <Th>IP</Th>
              <Th>Criada em</Th>
            </tr>
          </TableHead>

          <TableBody>
            {printers.map((printer) => (
              <TableRow key={printer.id}>
                <Td bold>
                  <Link
                    href={`/impressoras/${printer.id}`}
                    className="text-blue-600 hover:underline tracking-tight"
                  >
                    {printer.nome}
                  </Link>
                </Td>

                <Td>{printer.ip}</Td>

                <Td>
                  {new Date(printer.created_at).toLocaleString("pt-BR")}
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
