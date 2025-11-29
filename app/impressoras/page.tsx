import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ListaImpressoras() {
  const { data: printers, error } = await supabase
    .from("printers")
    .select("id, nome, ip, rede, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return <div className="p-8 text-red-600">Erro ao carregar impressoras ❌</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Impressoras Monitoradas</h1>

      {printers?.length === 0 ? (
        <p>Nenhuma impressora cadastrada.</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Nome</th>
              <th className="border p-2 text-left">IP</th>
              <th className="border p-2 text-left">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {printers?.map((printer) => (
              <tr key={printer.id}>
                <td className="border p-2">
                  <Link
                    href={`/impressoras/${printer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {printer.nome}
                  </Link>
                </td>
                <td className="border p-2">{printer.ip}</td>
                <td className="border p-2">
                  {new Date(printer.created_at).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
