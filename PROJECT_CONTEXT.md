# Contexto del Proyecto: Soru Restaurant Backend Mejora

Este documento resume el estado actual del proyecto Soru Restaurant Backend, las decisiones tomadas, los logros y los próximos pasos, basado en la conversación con la IA.

**Objetivo General:** Migrar y mejorar el backend (Node.js + Express) de un sistema de gestión de pedidos para usar PostgreSQL como base de datos principal, sentando las bases para escalabilidad y futuras funcionalidades.

**Estructura del Proyecto:**

*   `ceats-webapp/`: Repositorio principal.
*   `soru-restaurant/`: Proyecto Node.js del backend y frontend.
    *   `backend/`: Código del backend.
        *   `src/`: Archivos fuente (server.js, db.js, utils/).
            *   `utils/`: Utilidades (authUtils.js).
    *   `frontend/`: Código del frontend (HTML, CSS, JS).
    *   `Extras/`: Scripts (codigo.gs).
    *   `init_db.sql`: Script para inicializar la base de datos.
    *   `package.json`, `package-lock.json`: Configuracion de dependencias (en raiz de `soru-restaurant/`).
    *   `.env`: Variables de entorno (en raiz de `soru-restaurant/`).
    *   `.gitignore`: En raiz de `ceats-webapp/`.

**Tecnologías Clave:**

*   **Backend:** Node.js, Express, `pg` (PostgreSQL driver), `dotenv`, `bcrypt` (para hasheo).
*   **Base de Datos:** PostgreSQL (localmente y planeado en VPS Ubuntu). Tabla `pedidos`, Tabla `usuarios`.
*   **Frontend:** HTML, CSS, JavaScript plano (por ahora).
*   **Hosting Planeado:** VPS Ubuntu con Plesk. Docker para futura estandarizacion y orquestacion.
*   **Autenticación:** Inicialmente Email/Contraseña verificada contra DB. Futura integración con Google Sign-In.
*   **Autorización:** Roles 'admin' (ver todos los pedidos), 'sucursal' (ver pedidos de su sucursal).
*   **Sincronización Externa:** Google Apps Script (`codigo.gs`) para registro visual/histórico (sincronización asíncrona desde backend).

**Base de Datos PostgreSQL:**

*   **Base de Datos:** `soru_restaurant`.
*   **Tabla `pedidos`:** Almacena los pedidos.
    *   Columnas (snake_case): `codigo` (PK), `deliver_or_rest`, `estado`, `nombre`, `celular`, `sucursal`, `pedido` (TEXT/JSONB), `instrucciones`, `entregar_a`, `domicilio`, `total` (NUMERIC), `currency`, `pago`, `fecha` (DATE), `hora` (TIME), `tiempo` (VARCHAR/INTERVAL).
    *   Índices en `sucursal`, `estado`, `fecha`.
*   **Tabla `usuarios`:** Almacena los usuarios.
    *   Columnas (snake_case): `email` (PK/UNIQUE), `password_hash`, `role`, `sucursal` (NULLable), `created_at` (TIMESTAMP, DEFAULT), `updated_at` (TIMESTAMP, DEFAULT).
    *   Índices en `role`, `sucursal`.
*   **Script de Inicialización:** `init_db.sql` contiene scripts `DROP TABLE`, `CREATE TABLE` para `pedidos` y `usuarios`, `CREATE INDEX`, `COMMENT ON`, y `INSERT INTO` para registros iniciales (requiere hashes de contraseña reales).

**Logros y Decisiones Clave:**

*   Migración exitosa de operaciones CRUD de pedidos (GET, POST, PUT/Estado) a PostgreSQL.
*   Implementación de `db.js` con Pool de conexiones.
*   Configuración de variables de entorno con `.env`.
*   Rutas API ahora consultan/modifican la DB:
    *   `GET /api/pedidos.json` (o `/api/pedidos`) -> DB (todos).
    *   `GET /api/pedidos/:codigo` -> DB (uno).
    *   `GET /api/pedidos/sucursal/:sucursal` -> DB (filtrado por sucursal). **Implementada y Probada con Exito.**
    *   `POST /api/pedidos/:sucursal` -> DB (crear). Maneja dos formatos de entrada JSON. La sucursal de la URL tiene precedencia. **Implementada y Probada con Exito.**
    *   `POST /api/pedidos/:codigo/estado` (o PUT) -> DB (actualizar estado). Sincroniza con Google Sheets asíncronamente. **Implementada y Probada con Exito.**
    *   `DELETE /api/pedidos/:codigo` -> DB (eliminar). Endpoint básico añadido (sin autorización aún). **Implementada.**
*   Se eliminó la dependencia directa en `pedidos.json` y las funciones `cargarPedidos`/`guardarPedidos` en `server.js`.
*   Se eliminó la llamada directa a Google Sheets desde el frontend para actualización de estado.
*   Se decidió implementar la autenticación contra la tabla `usuarios` en PostgreSQL.
*   Se decidió usar `bcrypt` para hashear contraseñas.
*   Se creó la carpeta `utils` para código de apoyo.
*   Se creó el archivo `authUtils.js` para funciones de hasheo/comparación de contraseñas. **Código añadido.**

**Próximos Pasos (Lista de Tareas Pendientes):**

Actualmente nos encontramos en la **Tarea 4: Integrar la Autenticación con la Base de Datos**.

Pasos restantes de la Tarea 4:

1.  ~~Crear la Tabla `usuarios` en PostgreSQL (en DBeaver).~~ **COMPLETADO**
2.  ~~Actualizar `init_db.sql` para incluir la tabla `usuarios`.~~ **COMPLETADO**
3.  ~~Instalar la librería `bcrypt` (`npm install bcrypt`).~~ **COMPLETADO**
4.  ~~Crear el Módulo de Utilidades de Autenticación (`authUtils.js`).~~ **COMPLETADO**
5.  Crear el Script de Generación de Hashes (`generate_hashes.js`) en `./soru-restaurant/backend/scripts/`. **<-- NOS QUEDAMOS AQUÍ**
6.  Generar Hashes Iniciales usando `generate_hashes.js`.
7.  Actualizar `init_db.sql` con los hashes reales generados.
8.  Ejecutar `init_db.sql` en DBeaver para crear/recrear la base de datos con los usuarios iniciales.
9.  Modificar la Ruta `/api/login` en `server.js` para usar la tabla `usuarios` y `authUtils.js` (verificación de credenciales, establecimiento de sesión).
10. Modificar el Middleware de Sesión para adjuntar `req.user`.
11. Implementar Autorización en Rutas API (usando `req.user` para verificar permisos).

**Tareas Posteriores (Futuras):**

*   Ajustar el Frontend para interactuar con las nuevas rutas API (filtrado por sucursal, etc.).
*   Refinar manejo de errores y logging.
*   Configurar PM2 para gestionar el proceso de Node.js en VPS.
*   Configurar Nginx/Apache como proxy inverso en VPS.
*   Implementar "Iniciar Sesión con Google".
*   Desarrollar interfaces de administración (ej. para gestionar usuarios, dar de alta restaurantes/sucursales).
*   Considerar Docker para estandarización y orquestación.

**Para Continuar la Conversación:**

Copia y pega este texto en una nueva conversación con una IA. Indica que quieres retomar el proyecto "Soru Restaurant Backend Mejora" y que te quedaste en el paso 5 de la Tarea 4: "Crear el Script de Generación de Hashes (`generate_hashes.js`)".

---
