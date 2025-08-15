// frontend-nextjs/src/components/MessageDisplay/MessageDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMessage } from '../../context/MessageContext'; // Importa el hook para acceder a los mensajes
import styles from './MessageDisplay.module.css'; // Importa los estilos para los toasts

// Opcional: Definir una interfaz para la estructura de un toast
interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}


export default function MessageDisplay() {
    const { mensaje, error, info, setMensaje, setError, setInfo } = useMessage(); // Obtiene los mensajes y funciones del contexto

    // ** Estado LOCAL para gestionar múltiples toasts **
    // Esto es si quieres que aparezcan varios toasts si se activan rápido
    const [toasts, setToasts] = useState<Toast[]>([]);
    // ************************************************

    // Efecto para reaccionar cuando los mensajes globales cambian
    useEffect(() => {
        if (mensaje) {
            addToast('success', mensaje);
            // Opcional: Ocultar automáticamente después de un tiempo
            const timer = setTimeout(() => setMensaje(null), 5000); // Ocultar mensaje de éxito después de 5s
            return () => clearTimeout(timer); // Limpiar temporizador si el componente se desmonta o el mensaje cambia
        }
        if (error) {
            addToast('error', error);
             // Opcional: Ocultar errores no críticos
            const timer = setTimeout(() => setError(null), 7000); // Ocultar error después de 7s
            return () => clearTimeout(timer);
        }
         if (info) {
            addToast('info', info);
             // Opcional: Ocultar info
            const timer = setTimeout(() => setInfo(null), 5000); // Ocultar info después de 5s
            return () => clearTimeout(timer);
        }
        // NOTA: Los mensajes se activan por separado. Si setError y setMensaje se llaman rápido,
        // podrían aparecer ambos. La lógica de gestión de toasts múltiples ayuda aquí.

        // Limpiar mensajes globales después de que se convierten en toasts locales (si no se ocultan automáticamente)
        // setMensaje(null); // Si no usas auto-ocultar, limpia aquí
        // setError(null);
        // setInfo(null);

    }, [mensaje, error, info]); // Dependencias del useEffect: se ejecuta cuando mensaje, error o info cambian


    // Función para añadir un toast al estado local
    const addToast = (type: Toast['type'], message: string) => {
        const id = Date.now().toString(); // Generar un ID simple (puedes usar UUID si prefieres)
        setToasts(prevToasts => [...prevToasts, { id, type, message }]);

        // Lógica para eliminar el toast después de un tiempo (si no lo haces manualmente)
        setTimeout(() => {
            removeToast(id);
        }, 5000); // Los toasts desaparecen después de 5 segundos (ajustable)
    };

     // Función para eliminar un toast por ID
     const removeToast = (id: string) => {
         setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
     };


    // Renderiza el contenedor de toasts y los toasts individuales
    return (
        <div className={styles.toastContainer}> {/* Contenedor principal */}
            {toasts.map(toast => ( // Mapea el array de toasts locales
                <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}> {/* Aplica clases CSS Module */}
                    {/* Puedes añadir un icono basado en el tipo */}
                     {/* <i className={`icon-${toast.type}`}></i> */}
                    <span>{toast.message}</span> {/* El mensaje */}
                    <button className={styles.toastClose} onClick={() => removeToast(toast.id)}>X</button> {/* Botón de cerrar */}
                </div>
            ))}
        </div>
    );
}
