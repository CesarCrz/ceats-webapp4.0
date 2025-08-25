const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  usuario_id: string;
  email: string;
  role: 'admin' | 'empleado' | 'gerente';
  restaurante_id: string;
  sucursal_id: string | null;
  nombre: string;
  apellidos: string;
}

export interface Restaurante {
  restaurante_id: string;
  nombre: string;
  nombre_contacto_legal: string;
  email_contacto_legal: string;
  telefono_contacto_legal: string;
  direccion_fiscal: string;
  terminos_aceptados_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sucursal {
  sucursal_id: string;
  restaurante_id: string;
  nombre_sucursal: string;
  direccion: string;
  telefono: string;
  horario: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  pedido_id: string;
  codigo: string;
  deliver_or_rest: 'domicilio' | 'recoger';
  estado: string;
  nombre: string;
  celular: string;
  sucursal_id: string;
  pedido: string; // JSON string
  instrucciones: string;
  entregar_a: string;
  domicilio: string | null;
  total: number;
  currency: string;
  pago: string | null;
  fecha: string;
  hora: string;
  tiempo: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  // Autenticación
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await this.request<{
      success: boolean;
      token: string;
      email: string;
      role: string;
      restaurante_id: string;
      usuario_id: string;
      sucursal_id: string | null;
      nombre: string;
      apellidos: string;
    }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.success) {
      throw new Error('Login failed');
    }

    const user: User = {
      usuario_id: response.usuario_id,
      email: response.email,
      role: response.role as User['role'],
      restaurante_id: response.restaurante_id,
      sucursal_id: response.sucursal_id,
      nombre: response.nombre,
      apellidos: response.apellidos,
    };

    return { token: response.token, user };
  }

  // Restaurantes
  async createRestaurante(data: {
    nombreRestaurante: string;
    nombreContactoLegal: string;
    apellidosContactoLegal: string;
    emailContactoLegal: string;
    password: string;
    telefonoContactoLegal: string;
    direccionFiscal: string;
    fechaNacimientoContactoLegal: string;
  }): Promise<{ success: boolean; restauranteID: string; usuarioId: string }> {
    return this.request('/api/register-restaurantero', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRestaurantes(): Promise<Restaurante[]> {
    return this.request('/api/restaurantes');
  }

  // Sucursales
  async createSucursal(data: {
    restaurante_id: string;
    nombre_sucursal: string;
    direccion: string;
    telefono: string;
    horario: string;
  }): Promise<Sucursal> {
    return this.request('/api/sucursales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSucursales(restauranteId: string): Promise<Sucursal[]> {
    return this.request(`/api/sucursales/${restauranteId}`);
  }

  // Usuarios
  async createUsuario(data: {
    email: string;
    password: string;
    role: string;
    restaurante_id: string;
    sucursal_id?: string;
    nombre: string;
    apellidos: string;
    fecha_nacimiento: string;
    telefono: string;
  }): Promise<User> {
    return this.request('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsuarios(restauranteId: string): Promise<User[]> {
    return this.request(`/api/usuarios/${restauranteId}`);
  }

  // Pedidos
  async getPedidosSucursal(sucursalId: string): Promise<Pedido[]> {
    return this.request(`/api/pedidos/sucursal/${sucursalId}`);
  }

  async getAllPedidos(): Promise<Pedido[]> {
    return this.request('/api/pedidos.json');
  }

  async updatePedidoEstado(codigo: string, estado: string): Promise<{ success: boolean; mensaje: string }> {
    return this.request(`/api/pedidos/${codigo}/estado`, {
      method: 'POST',
      body: JSON.stringify({ estado }),
    });
  }

  async deletePedido(codigo: string): Promise<{ success: boolean; mensaje: string }> {
    return this.request(`/api/pedidos/${codigo}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
