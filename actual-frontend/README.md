# cEats v2 - Sistema de Gestión de Restaurantes

Plataforma profesional para la gestión integral de restaurantes con arquitectura multi-tenant.

## 🚀 Configuración Rápida

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Configuración del entorno
NODE_ENV=development
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3001`

## 🔧 Características

- **Autenticación JWT** con persistencia en localStorage
- **Gestión de Roles**: Admin, Empleado, Gerente
- **Multi-tenant**: Soporte para múltiples restaurantes
- **Dashboard en Tiempo Real**: Visualización de pedidos por estado
- **Responsive Design**: Optimizado para móviles y desktop

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 + React + TypeScript
- **Backend**: Node.js + Express + PostgreSQL
- **Autenticación**: JWT + bcrypt
- **Base de Datos**: PostgreSQL con UUIDs

## 📱 Páginas Principales

- `/login` - Inicio de sesión
- `/dashboard` - Panel principal de pedidos
- `/usuarios` - Gestión de usuarios
- `/sucursales` - Gestión de sucursales
- `/historial` - Historial de pedidos
- `/reportes` - Estadísticas y reportes

## 🔐 Roles de Usuario

- **Admin**: Acceso completo al restaurante y todas las sucursales
- **Empleado**: Acceso limitado a su sucursal asignada
- **Gerente**: Acceso a su sucursal con permisos extendidos

## 🌐 API Endpoints

- `POST /api/login` - Autenticación
- `GET /api/pedidos.json` - Todos los pedidos (Admin)
- `GET /api/pedidos/sucursal/:id` - Pedidos por sucursal
- `POST /api/pedidos/:sucursal_id` - Crear pedido
- `PUT /api/pedidos/:codigo/estado` - Actualizar estado

## 🚨 Consideraciones de Seguridad

- **JWT_SECRET**: Mínimo 32 caracteres, único por aplicación
- **SESSION_SECRET**: Mínimo 32 caracteres, único por aplicación
- **CORS**: Configurar dominio específico en producción
- **HTTPS**: Habilitar en producción para cookies seguras

## 📊 Estados de Pedidos

- **Pendiente**: Pedido nuevo recibido
- **Preparando**: Pedido en proceso
- **Listo**: Pedido completado
- **Entregado**: Pedido entregado al cliente
- **Cancelado**: Pedido cancelado

## 🔄 Flujo de Trabajo

1. **Recepción**: Pedido llega desde WhatsApp/Google Apps Script
2. **Asignación**: Se asigna automáticamente a la sucursal correspondiente
3. **Preparación**: El personal actualiza el estado a "Preparando"
4. **Completado**: Se marca como "Listo" cuando está terminado
5. **Entrega**: Se confirma la entrega al cliente

## 🛠️ Desarrollo

### Estructura de Archivos

```
src/
├── app/           # Páginas de Next.js App Router
├── components/    # Componentes reutilizables
├── context/       # Contextos de React (Auth)
├── lib/          # Utilidades y cliente API
└── types/        # Definiciones de TypeScript
```

### Cliente API

El `ApiClient` maneja todas las comunicaciones con el backend:

```typescript
import { apiClient } from '@/lib/api'

// Login
const { token, user } = await apiClient.login(credentials)

// Obtener pedidos
const pedidos = await apiClient.getAllPedidos()
```

### Contexto de Autenticación

```typescript
import { useAuth } from '@/context/AuthContext'

const { user, login, logout, isAuthenticated } = useAuth()
```

## 📝 Notas de Implementación

- **UUIDs**: Todos los IDs son UUIDs para mayor seguridad
- **Soft Delete**: Los registros se marcan como inactivos, no se eliminan
- **Validación**: Validación tanto en frontend como backend
- **Error Handling**: Manejo robusto de errores con mensajes informativos

## 🚀 Despliegue

### Producción

1. Configurar variables de entorno de producción
2. Habilitar HTTPS
3. Configurar CORS con dominio específico
4. Configurar cookies seguras
5. Implementar rate limiting

### Variables de Entorno de Producción

```bash
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NODE_ENV=production
```

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, consulta la documentación del backend o contacta al equipo de desarrollo.
