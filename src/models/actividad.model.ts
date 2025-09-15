export interface Actividad {
    id: string;
    nombre: string;
    descripcion?: string;
    fecha_inicio: string; // ISO date (e.g., "2023-10-01")
    fecha_fin?: string;
    estado: 'planeada' | 'en_curso' | 'completada';
    meta: number;
    user_id?: string; // UUID del usuario autenticado
    created_at: string;
    updated_at: string;
  }