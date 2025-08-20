// frontend-nextjs/src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './signup.module.css';
// ** Importa el hook personalizado useMessage **
import { useMessage } from '../../context/MessageContext'; // <-- Asegúrate de que la ruta sea correcta
// *********************************************


export default function SignupPage() {
    // Definir estados para los campos del formulario (Estos se mantienen locales)
    const [nombreRestaurante, setNombreRestaurante] = useState('');
    const [nombreContactoLegal, setNombreContactoLegal] = useState('');
    const [apellidosContactoLegal, setApellidosContactoLegal] = useState('');
    const [emailContactoLegal, setEmailContactoLegal] = useState('');
    const [password, setPassword] = useState('');
    const [telefonoContactoLegal, setTelefonoContactoLegal] = useState('');
    const [direccionFiscal, setDireccionFiscal] = useState('');
    const [fechaNacimientoContactoLegal, setFechaNacimientoContactoLegal] = useState('');
    const [aceptoTerminos, setAceptoTerminos] = useState(false);

    // ** Estado LOCAL para la carga (Este se mantiene local) **
    const [cargando, setCargando] = useState(false);
    // *******************************************************

    // ** OBTENER las funciones para establecer mensajes del hook useMessage **
    const { setMensaje, setError, setInfo } = useMessage(); // También puedes obtener setInfo si lo necesitas


    // Manejador del envío del formulario
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Limpiar mensajes ANTES de la solicitud (usando las funciones del hook)
        setMensaje(null); // <-- USAS LA FUNCIÓN DEL HOOK
        setError(null);   // <-- USAS LA FUNCIÓN DEL HOOK
        setCargando(true);


        // Validaciones frontend: Asegurarse de que los campos requeridos estén presentes
        // (Esta validación local sigue siendo útil antes de enviar al backend)
        if (!nombreRestaurante || !nombreContactoLegal || !apellidosContactoLegal || !emailContactoLegal || !password || !telefonoContactoLegal || !direccionFiscal || !fechaNacimientoContactoLegal) {
            setError('Por favor, complete todos los campos requeridos.'); // <-- USAS LA FUNCIÓN DEL HOOK
            setCargando(false);
            return;
        }

        // Validar formato básico del email en frontend (opcional)
        if (!/\S+@\S+\.\S+/.test(emailContactoLegal)) {
            setError('Por favor, ingrese un formato de correo electrónico válido.'); // <-- USAS LA FUNCIÓN DEL HOOK
            setCargando(false);
            return;
        }

        // Validar que los términos y condiciones fueron aceptados
        if (!aceptoTerminos) {
            setError('Debe aceptar los Términos y Condiciones para registrarse.'); // <-- USAS LA FUNCIÓN DEL HOOK
            setCargando(false);
            return;
        }


        // Construir el objeto de datos
        const formData = { 
            nombreRestaurante,
            nombreContactoLegal,
            apellidosContactoLegal,
            emailContactoLegal,
            password,
            telefonoContactoLegal,
            direccionFiscal,
            fechaNacimientoContactoLegal
        };

        console.log('Enviando datos:', formData);


        try {
            const response = await axios.post('http://localhost:3000/api/register-restaurantero', formData);
            // Mostrar mensaje de éxito usando la función del hook
            setMensaje(response.data.message || 'Registro exitoso.'); // <-- USAS LA FUNCIÓN DEL HOOK
            console.log('Registro exitoso:', response.data);

             // TODO: Opcional: Limpiar el formulario después de éxito (si no rediriges)
             // resetForm();

             // TODO: Redirigir al usuario a una página de "Verificar Email" o login

        } catch (err: any) {
             // Manejar errores usando la función del hook
            if (axios.isAxiosError(err)) {
                 if (err.response) {
                     setError(err.response.data.message || err.response.data.error || `Error del servidor: ${err.response.status}`); // <-- USAS LA FUNCIÓN DEL HOOK
                     console.error('Error de respuesta del backend:', err.response.status, err.response.data);
                 } else if (err.request) {
                      setError('Error de red: No se recibió respuesta del servidor.'); // <-- USAS LA FUNCIÓN DEL HOOK
                      console.error('Error de red:', err.request);
                 } else {
                     setError('Error al configurar la solicitud.'); // <-- USAS LA FUNCIÓN DEL HOOK
                     console.error('Error de configuración de axios:', err.message);
                 }
             } else {
                 setError('Ocurrió un error inesperado.'); // <-- USAS LA FUNCIÓN DEL HOOK
                 console.error('Error inesperado:', err);
             }
        } finally {
            setCargando(false);
        }
    };


    return (
        // Contenedor principal con gradiente
        <div className={styles.signupContainer}>
            {/* Tarjeta blanca del formulario */}
            <div className={styles.signupCard}>
                {/* Header de la tarjeta */}
                <div className={styles.signupHeader}>
                    <h1>Registro de Restaurante</h1>
                </div>

                {/* Formulario interior */}
                <form className={styles.signupForm} onSubmit={handleSubmit}>

                    {/* ** ELIMINA ESTE JSX QUE RENDERIZA LOS MENSAJES LOCALES ** */}
                    {/* {cargando && <p className={styles.loadingMessage}>Registrando...</p>} */}
                    {/* {mensaje && <p className={styles.messageSuccess}> */}
                    {/*    {mensaje} */}
                    {/* </p>} */}
                    {/* {error && <p className={styles.messageError}> */}
                    {/*    {error} */}
                    {/* </p>} */}
                    {/* ********************************************************* */}

                    {/* Sección Información del Restaurante */}
                    <h2>Información del Restaurante</h2>
                    {/* ... (campos del formulario con className={styles.formGroup}, value, onChange, required, disabled) ... */}
                     <div className={styles.formGroup}>
                        <label htmlFor="nombreRestaurante">Nombre del Restaurante:</label>
                        <input
                            type="text"
                            id="nombreRestaurante"
                            value={nombreRestaurante}
                            onChange={(e) => setNombreRestaurante(e.target.value)}
                            required
                            disabled={cargando}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="direccionFiscal">Dirección Fiscal:</label>
                        <input
                            type="text"
                            id="direccionFiscal"
                            value={direccionFiscal}
                            onChange={(e) => setDireccionFiscal(e.target.value)}
                            disabled={cargando}
                        />
                    </div>


                    {/* Sección Información del Contacto Legal */}
                    <h2>Información del Contacto Legal (Administrador)</h2>
                     <div className={styles.formGroup}>
                        <label htmlFor="nombreContactoLegal">Nombre:</label>
                        <input
                            type="text"
                            id="nombreContactoLegal"
                            value={nombreContactoLegal}
                            onChange={(e) => setNombreContactoLegal(e.target.value)}
                            required
                             disabled={cargando}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="apellidosContactoLegal">Apellidos:</label>
                        <input
                            type="text"
                            id="apellidosContactoLegal"
                            value={apellidosContactoLegal}
                            onChange={(e) => setApellidosContactoLegal(e.target.value)}
                            required
                             disabled={cargando}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="emailContactoLegal">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="emailContactoLegal"
                            value={emailContactoLegal}
                            onChange={(e) => setEmailContactoLegal(e.target.value)}
                            required
                             disabled={cargando}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                             disabled={cargando}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="telefonoContactoLegal">Teléfono:</label>
                        <input
                            type="tel"
                            id="telefonoContactoLegal"
                            value={telefonoContactoLegal}
                            onChange={(e) => setTelefonoContactoLegal(e.target.value)}
                            required
                             disabled={cargando}
                        />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="fechaNacimientoContactoLegal">Fecha de Nacimiento:</label>
                        <input
                            type="date"
                            id="fechaNacimientoContactoLegal"
                            value={fechaNacimientoContactoLegal}
                            onChange={(e) => setFechaNacimientoContactoLegal(e.target.value)}
                            required
                             disabled={cargando}
                        />
                    </div>


                    {/* Sección Términos y Condiciones */}
                    <h2>Términos y Condiciones</h2>
                    <div className={styles.formGroup}>
                        <input
                            type="checkbox"
                            id="aceptoTerminos"
                            checked={aceptoTerminos}
                            onChange={(e) => setAceptoTerminos(e.target.checked)}
                            required
                             disabled={cargando}
                        />
                         <label htmlFor="aceptoTerminos">Acepto los <a href="/terminos" className={styles.termsLink} target="_blank">Términos y Condiciones</a></label>
                    </div>


                    {/* Botón de envío */}
                    <button type="submit" className={styles.signupButton} disabled={cargando}>
                         {cargando ? 'Registrando...' : 'Registrar Restaurante'}
                     </button>
                 </form>
             </div>
         </div>
     );
 }
