import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impostor Game - Multijugador",
  description: "Juego multijugador tipo Impostor en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {children}
      </body>
    </html>
  );
}
