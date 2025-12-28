import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kiosko App",
  description: "Aplicación de gestión de kioskos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`antialiased bg-gray-100 text-gray-900 ${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}
