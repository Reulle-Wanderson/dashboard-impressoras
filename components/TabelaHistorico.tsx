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

export default function TabelaHistorico({ registros }: { registros: Registro[] }) {
  const [buscaNome, setBuscaNome] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroPaginas, setFiltroPaginas] = useState("");

  // Datas únicas
  const listaDatas = [...new Set(registros.map((r) => r.data))];

  // Filtragem final
  const filtrados = useMemo(() => {
    return registros.filter((r) => {
      const nome = r.printer_id?.nome?.toLowerCase() ?? "";

      // FILTRO POR NOME
      if (buscaNome && !nome.includes(buscaNome.toLowerCase())) return false;

      // FILTRO POR DATA
      if (filtroData && r.data !== filtroData) return false;

      // FILTRO POR PÁGINAS
      if (filtroPaginas && !String(r.paginas).includes(filtroPaginas)) return false;

      return true;
    });
  }, [registros, buscaNome, filtroData, filtroPaginas]);

  return (
    <div className="w-full p-4 bg-white rounded shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">

            {/* Busca pelo nome */}
            <th className="p-2 border w-1/3">
              <div className="flex flex-col">
                <span>Impressora</span>
                <input
                  type="text"
                  placeholder="Buscar nome..."
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  className="mt-1 p-1 border rounded"
                />
              </div>
            </th>

            {/* Filtro por Data */}
            <th className="p-2 border w-1/3">
              <div className="flex flex-col">
                <span>Data</span>
                <select
                  className="mt-1 p-1 border rounded"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                >
                  <option value="">(Todas)</option>
                  {listaDatas.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString("pt-BR")}
                    </option>
                  ))}
                </select>
              </div>
            </th>

            {/* Filtro por páginas */}
            <th className="p-2 border w-1/3">
              <div className="flex flex-col">
                <span>Páginas</span>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filtroPaginas}
                  onChange={(e) => setFiltroPaginas(e.target.value)}
                  className="mt-1 p-1 border rounded"
                />
              </div>
            </th>

          </tr>
        </thead>

        <tbody>
          {filtrados.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border p-2">{r.printer_id?.nome}</td>
              <td className="border p-2">
                {new Date(r.data).toLocaleDateString("pt-BR")}
              </td>
              <td className="border p-2">
                {r.paginas.toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
