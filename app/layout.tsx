import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comunidade Santa Madalena",
  description: "Paróquia Santa Maria Madalena – Fé, esperança e caridade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
