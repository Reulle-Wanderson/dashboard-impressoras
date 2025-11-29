import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "sonner";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {/* Navbar */}
        <nav className="w-full bg-white shadow p-4 flex gap-6 mb-6">
          <Link href="/" className="font-medium hover:underline">
            Impressoras
          </Link>

          <Link href="/impressoras/nova" className="font-medium hover:underline">
            Cadastrar Impressora
          </Link>

          <Link href="/historico" className="font-medium hover:underline">
            Histórico
          </Link>

          <Link href="/dashboard" className="font-medium hover:underline">
            Dashboard
          </Link>

          <Link
            href="/financeiro"
            className="font-medium hover:underline text-blue-600 font-semibold"
          >
            Financeiro
          </Link>

          <Link href="/impressoras/substituir" className="font-medium hover:underline">
            Substituir Impressora
          </Link>
        </nav>

        {/* Conteúdo */}
        <div className="max-w-6xl mx-auto px-4">{children}</div>

        {/* Toaster */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
