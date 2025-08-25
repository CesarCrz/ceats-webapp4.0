// Configuración de la API del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tipos de datos para la API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  usuario_id: string;
  email: string;
  role: string;
  nombre: string;
  apellidos: string;
  restaurante_id: string;
  sucursal_id?: string;
  is_active: boolean;
}

export interface Restaurante {
  restaurante_id: string;
  nombre: string;
  nombre_contacto_legal: string;
  email_contacto_legal: string;
  telefono_contacto_legal: string;
  direccion_fiscal: string;
  is_active: boolean;
}

export interface Sucursal {
  sucursal_id: string;
  restaurante_id: string;
  nombre_sucursal: string;
  direccion: string;
  telefono_contacto: string;
  ciudad: string;
  estado: string;
  is_active: boolean;
}

export interface Pedido {
  pedido_id: string;
  codigo: string;
  sucursal_id: string;
  deliver_or_rest: string;
  estado: string;
  nombre: string;
  celular: string;
  pedido: any;
  instrucciones: string;
  entregar_a: string;
  domicilio?: string;
  total: number;
  currency: string;
  pago?: string;
  fecha: string;
  hora: string;
  tiempo?: string;
}

// Clase para manejar las llamadas a la API
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Método para establecer el token de autenticación
  setToken(token: string) {
    this.token = token;
  }

  // Método para limpiar el token
  clearToken() {
    this.token = null;
  }

  // Método privado para hacer peticiones HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await this.request<{ success: boolean; token: string; email: string; role: string; sucursal: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success) {
      throw new Error('Login failed');
    }

    // Crear objeto user básico con la información disponible
    const user: User = {
      usuario_id: '', // No disponible en la respuesta actual
      email: response.email,
      role: response.role,
      nombre: '', // No disponible en la respuesta actual
      apellidos: '', // No disponible en la respuesta actual
      restaurante_id: '', // No disponible en la respuesta actual
      sucursal_id: response.sucursal || undefined,
      is_active: true,
    };

    return { token: response.token, user };
  }

  async registerRestaurantero(data: {
    nombreRestaurante: string;
    nombreContactoLegal: string;
    apellidosContactoLegal: string;
    emailContactoLegal: string;
    password: string;
    telefonoContactoLegal: string;
    direccionFiscal: string;
    fechaNacimientoContactoLegal: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/register-restaurantero', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos para restaurantes
  async createRestaurante(data: Omit<Restaurante, 'restaurante_id' | 'is_active'>): Promise<Restaurante> {
    return this.request<Restaurante>('/api/restaurantes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRestaurantes(): Promise<Restaurante[]> {
    return this.request<Restaurante[]>('/api/restaurantes');
  }

  // Métodos para sucursales
  async createSucursal(data: Omit<Sucursal, 'sucursal_id' | 'is_active'>): Promise<Sucursal> {
    return this.request<Sucursal>('/api/sucursales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSucursales(restauranteId: string): Promise<Sucursal[]> {
    return this.request<Sucursal[]>(`/api/sucursales/${restauranteId}`);
  }

  // Métodos para usuarios
  async createUsuario(data: Omit<User, 'usuario_id' | 'is_active'>): Promise<User> {
    return this.request<User>('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsuarios(restauranteId: string): Promise<User[]> {
    return this.request<User[]>(`/api/usuarios/${restauranteId}`);
  }

  // Métodos para pedidos
  async getPedidosSucursal(sucursalId: string): Promise<Pedido[]> {
    return this.request<Pedido[]>(`/api/pedidos/sucursal/${sucursalId}`);
  }

  async getAllPedidos(): Promise<Pedido[]> {
    return this.request<Pedido[]>('/api/pedidos.json');
  }

  async updatePedidoEstado(codigo: string, estado: string): Promise<{ success: boolean; mensaje: string }> {
    return this.request<{ success: boolean; mensaje: string }>(`/api/pedidos/${codigo}/estado`, {
      method: 'POST',
      body: JSON.stringify({ estado }),
    });
  }

  async deletePedido(codigo: string): Promise<{ success: boolean; mensaje: string }> {
    return this.request<{ success: boolean; mensaje: string }>(`/api/pedidos/${codigo}`, {
      method: 'DELETE',
    });
  }
}

// Exportar una instancia única del cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Exportar tipos para uso en otros archivos
export type { LoginCredentials, User, Restaurante, Sucursal, Pedido };
