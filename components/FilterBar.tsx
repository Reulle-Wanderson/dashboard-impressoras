"use client";

import { useState } from "react";

export default function FilterBar({ onApply }: { onApply: (f: any) => void }) {
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
    <div className="flex gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
      {/* Impressora */}
      <div>
        <label className="text-sm">ID da Impressora</label>
        <input
          className="border p-2 rounded"
          value={printer}
          onChange={(e) => setPrinter(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      {/* Data início */}
      <div>
        <label className="text-sm">Data início</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
      </div>

      {/* Data fim */}
      <div>
        <label className="text-sm">Data fim</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={apply}
      >
        Aplicar
      </button>
    </div>
  );
}
