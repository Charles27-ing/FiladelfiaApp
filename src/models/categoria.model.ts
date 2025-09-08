export interface Categoria {
    id: string; // UUID como string
    nombre: string;
    tipo: 'ingreso' | 'egreso';
    descripcion?: string;
    created_at: string; // Fechas como ISO string
    updated_at: string;
  }