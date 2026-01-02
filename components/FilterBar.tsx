"use client";

import { useState } from "react";

export default function FilterBar({
  onApply,
}: {
  onApply: (f: {
    printer: string | null;
    dataInicio: string | null;
    dataFim: string | null;
  }) => void;
}) {
  const [printer, setPrinter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  function apply() {
    onApply({
      printer: printer || null,
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
    });
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow space-y-4">
      {/* =========================
          TÍTULO
      ========================= */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          Filtros
        </h3>
        <p className="text-sm text-gray-500">
          Refine os dados exibidos
        </p>
      </div>

      {/* =========================
          CAMPOS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Impressora */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            ID da impressora
          </label>
          <input
            className="border rounded px-3 py-2"
            value={printer}
            onChange={(e) => setPrinter(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        {/* Data início */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Data início
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        {/* Data fim */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Data fim
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        {/* Botão */}
        <button
          onClick={apply}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Aplicar filtros
        </button>
      </div>
    </section>
  );
}
