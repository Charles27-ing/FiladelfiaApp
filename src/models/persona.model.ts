// src/models/persona.model.ts

/**
 * Define la estructura de datos para una Persona.
 * Esta interfaz se usará en todo el proyecto para asegurar
 * que siempre trabajamos con objetos 'Persona' consistentes.
 */
export interface Persona {
    id: number; // El ID siempre vendrá de la base de datos
    created_at: string; // La fecha de creación también vendrá de la BD
    user_id: string;
  
    tipo_id: string;
    numero_id: string;
    nombres: string;
    primer_apellido: string;
    segundo_apellido: string | null; // Puede ser nulo
    genero: string;
    fecha_nacimiento: string;
    edad: number | null; // Puede ser nulo
    email: string;
    direccion: string;
    telefono: string;
    id_escala: number;
    url_foto: string | null; // Puede ser nulo
  }
  
  /**
   * Define la estructura para crear una nueva Persona.
   * Es igual a la interfaz Persona, pero omitiendo los campos
   * que son generados automáticamente por la base de datos (id, created_at).
   * Esto nos ayuda a evitar errores al crear nuevos registros.
   */
  export type NuevaPersona = Omit<Persona, 'id' | 'created_at' | 'user_id'>;
  