"use client";

import { useState, useMemo } from "react";

interface Registro {
  data: string;
  paginas: number;
  printer_id: {
    id: string | null;
    nome: string | null;
  };
}

export default function TabelaHistorico({
  registros,
}: {
  registros: Registro[];
}) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    if (!busca) return registros;

    return registros.filter((r) =>
      r.printer_id?.nome
        ?.toLowerCase()
        .includes(busca.toLowerCase())
    );
  }, [registros, busca]);

  return (
    <div className="space-y-3">
      {/* Barra superior */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Buscar impressora"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-64"
        />

        <span className="ml-auto text-sm text-gray-500">
          {filtrados.length} registros
        </span>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium text-center">
                Impressora
              </th>
              <th className="px-4 py-3 font-medium text-center">
                Data
              </th>
              <th className="px-4 py-3 font-medium text-center">
                Páginas
              </th>
            </tr>
          </thead>

          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              filtrados.map((r, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    {r.printer_id?.nome ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {new Date(r.data).toLocaleDateString("pt-BR")}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {r.paginas.toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
