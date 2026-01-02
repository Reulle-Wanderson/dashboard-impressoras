import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Printer Monitor",
  description: "Sistema de monitoramento de impressoras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        {/* =========================
            HEADER SUPERIOR
        ========================= */}
        <header className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 shadow">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* LOGO / TÍTULO */}
              <div className="flex items-center gap-3 text-white">
                <div className="text-2xl font-extrabold tracking-wide">
                  Printer Monitor
                </div>
                <span className="text-xs text-blue-200 hidden sm:block">
                  Gestão e controle de impressoras
                </span>
              </div>

              {/* MENU */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
                <Link href="/" className="hover:text-cyan-300 transition">
                  Impressoras
                </Link>

                <Link
                  href="/impressoras/nova"
                  className="hover:text-cyan-300 transition"
                >
                  Cadastrar
                </Link>

                <Link
                  href="/historico"
                  className="hover:text-cyan-300 transition"
                >
                  Histórico
                </Link>

                <Link
                  href="/dashboard"
                  className="hover:text-cyan-300 transition"
                >
                  Dashboard
                </Link>

                <Link
                  href="/financeiro"
                  className="text-cyan-300 border-b-2 border-cyan-300 pb-1"
                >
                  Financeiro
                </Link>

                <Link
                  href="/impressoras/substituir"
                  className="hover:text-cyan-300 transition"
                >
                  Substituir
                </Link>
              </nav>

              {/* USUÁRIO / AÇÃO */}
              <div className="hidden md:flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-400 flex items-center justify-center text-blue-900 font-bold">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =========================
            CONTEÚDO
        ========================= */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>

        {/* =========================
            TOASTER
        ========================= */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
