// frontend-nextjs/src/context/MessageContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react'; // Importa funciones de React

// Define la estructura de los datos que este contexto va a proveer
interface MessageContextType {
  mensaje: string | null;
  error: string | null;
  info: string | null;
  setMensaje: (msg: string | null) => void;
  setError: (err: string | null) => void;
  setInfo: (info: string | null) => void; // <-- Corregido el tipo de 'info'
}

// Crea el Contexto
const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Crea el Proveedor del Contexto
export function MessageProvider({ children }: { children: ReactNode }) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null); // <-- Añadido el estado info

  // TODO: Lógica futura para ocultar mensajes automáticamente

  return (
    <MessageContext.Provider value={{ mensaje, error, info, setMensaje, setError, setInfo }}>
      {children} {/* Renderiza los componentes hijos */}
      {/* **** La UI de los mensajes se renderiza en MessageDisplay, no aquí **** */}
      {/* Elimina cualquier div temporal de mensajes que tengas aquí */}
    </MessageContext.Provider>
  );
}

// Crea el Hook Personalizado
export function useMessage() {
    const context = useContext(MessageContext);

    if (context === undefined) {
      throw new Error('useMessage debe ser usado dentro de un MessageProvider');
    }

    return { // Devuelve explícitamente todos los valores del contexto
        mensaje: context.mensaje,
        error: context.error,
        info: context.info,
        setMensaje: context.setMensaje,
        setError: context.setError,
        setInfo: context.setInfo
    };
}
