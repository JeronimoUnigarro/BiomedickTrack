export type UserRole = 'gerencia' | 'ingeniero';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  telefono?: string;
  createdAt: Date;
}

export type EstadoEquipo = 'activo' | 'mantenimiento' | 'inactivo';
export type CriticidadEquipo = 'alta' | 'media' | 'baja';
export type TipoMantenimiento = 'preventivo' | 'correctivo';

export interface Equipo {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  serie: string;
  fabricante: string;
  paisOrigen: string;
  añoFabricacion: number;
  fechaAdquisicion: Date;
  costoAdquisicion: number;
  proveedor: string;
  ubicacion: string;
  area: string;
  responsable: string;
  estado: EstadoEquipo;
  criticidad: CriticidadEquipo;
  especificaciones: {
    voltaje?: string;
    frecuencia?: string;
    potencia?: string;
    dimensiones?: string;
    peso?: string;
    otros?: string;
  };
  accesorios: string[];
  observaciones?: string;
  ultimoMantenimiento?: Date;
  proximoMantenimiento?: Date;
  createdAt: Date;
}

export interface Mantenimiento {
  id: string;
  equipoId: string;
  tipo: TipoMantenimiento;
  fecha: Date;
  tecnicoResponsable: string;
  descripcion: string;
  observaciones?: string;
  repuestos?: string[];
  costo?: number;
  duracion?: number; // en horas
  estadoAnterior?: EstadoEquipo;
  estadoPosterior?: EstadoEquipo;
  createdBy: string;
  createdAt: Date;
}

export interface Alerta {
  id: string;
  equipoId: string;
  equipoNombre: string;
  tipo: 'mantenimiento_vencido' | 'mantenimiento_proximo' | 'equipo_critico' | 'equipo_inactivo';
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha: Date;
  leida: boolean;
}

export interface Bitacora {
  id: string;
  equipoId: string;
  fecha: Date;
  usuario: string;
  accion: string;
  detalles: string;
  firmaDigital?: string; // simulado
}

export interface DashboardStats {
  totalEquipos: number;
  equiposActivos: number;
  equiposMantenimiento: number;
  equiposInactivos: number;
  alertasActivas: number;
  equiposCriticos: number;
  mantenimientosMes: number;
  costoMantenimientoMes: number;
}
