export interface Transaccion {
    id: string;
    fecha: string; // ISO date
    monto: number; // E.g., 100000.00
    tipo: 'ingreso' | 'egreso';
    categoria_id: string; // UUID de categoria
    descripcion?: string;
    actividad_id?: string; // UUID de actividad, opcional
    user_id?: string; // UUID del usuario que registra
    evidencia?: string; // URL de archivo en Storage
    created_at: string;
    updated_at: string;
  }