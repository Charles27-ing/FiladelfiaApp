export interface Persona {
  id: string;
  created_at: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  tipo_id: string;
  numero_id: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  url_foto?: string;
  user_id: string;
  sede_id: string;
  estado_civil: string;
  departamento: string;
  municipio: string;
  bautizado: boolean;
  sedes?: { nombre_sede: string; direccion_sede: string; };
  persona_escala?: Array<{ escala_de_crecimiento: { nombre_escala: string; }; }>;
  persona_ministerios?: Array<{ ministerios: { id: string; nombre_minist: string; }; }>;
}

export interface NuevaPersona {
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  tipo_id: string;
  numero_id: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  url_foto?: string;
  sede_id: string;
  estado_civil: string;
  departamento: string;
  municipio: string;
  bautizado: boolean;
  ministerios?: string[]; // Para la creación, se enviarán los IDs de los ministerios
}

export interface Municipio {
  id: string;
  nombre: string;
}

export interface Departamento {
  id: string;
  nombre: string;
  ciudades: Municipio[];
}


