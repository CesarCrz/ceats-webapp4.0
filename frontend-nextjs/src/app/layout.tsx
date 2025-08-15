// frontend-nextjs/src/app/layout.tsx

import type { Metadata } from "next";
// ** Asegúrate de que Geist y Geist_Mono estén importados si los usas **
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css"; // Importa tus estilos globales

// ** Importa el Proveedor de Mensajes y la componente de display **
import { MessageProvider } from '../context/MessageContext'; // <-- Asegúrate de que la ruta sea correcta
import MessageDisplay from '../components/MessageDisplay/MessageDisplay'; // <-- Asegúrate de que la ruta sea correcta
// **************************************************************


// ** Definir las fuentes FUERA del componente RootLayout **
const geistSans = Geist({ // Si usas estas fuentes
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ // Si usas estas fuentes
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// ****************************************************


export const metadata: Metadata = {
  title: "cEats Platform", // Título de tu aplicación
  description: "Plataforma de gestión para restaurantes", // Descripción
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //idioma
    <html lang="es"> 
      <body className={`${geistSans.variable} ${geistMono.variable}`}> {/* O elimina si no las usas */}
        {/* ** Envuelve el contenido principal con el Proveedor de Mensajes ** */}
        <MessageProvider>
          {children} {/* Renderiza tus páginas */}
          {/* ** Renderiza la componente que mostrará los toasts ** */}
          <MessageDisplay /> {/* <-- Asegúrate de que esta componente exista y esté importada */}
        </MessageProvider>
      </body>
    </html>
  );
}
