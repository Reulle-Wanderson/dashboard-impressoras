import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">IP</th>
                <th className="p-3 text-left">Criada em</th>
              </tr>
            </thead>

            <tbody>
              {printers.map((printer) => (
                <tr
                  key={printer.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <Link
                      href={`/impressoras/${printer.id}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {printer.nome}
                    </Link>
                  </td>

                  <td className="p-3">{printer.ip}</td>

                  <td className="p-3">
                    {new Date(printer.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
