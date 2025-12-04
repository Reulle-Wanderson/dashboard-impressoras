export default function AuthRestrito() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Acesso Restrito 🔒</h1>

        <p className="text-gray-700 mb-6">
          Esta área está desativada e não está disponível na versão online.
        </p>

        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Voltar ao início
        </a>
      </div>
    </main>
  );
}
