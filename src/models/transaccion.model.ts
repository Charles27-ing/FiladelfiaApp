export interface Transaccion {
    id: string;
    fecha: string; // ISO date
    monto: number; // E.g., 100000.00
    tipo: 'ingreso' | 'egreso';
    categoria_id: string; // UUID de categoria
    descripcion?: string;
    actividad_id?: string; // UUID de actividad, opcional
    user_id?: string; // UUID del usuario que registra
    persona_id?: string; // UUID de persona, opcional
    evidencia?: string; // URL de archivo en Storage
    numero_transaccion?: string; // Número único de transacción (ej: ING001, EGR001)
    estado?: 'activa' | 'anulada'; // Estado de la transacción
    notas_anulacion?: string; // Razón de anulación si aplica
    created_at: string;
    updated_at: string;
  }