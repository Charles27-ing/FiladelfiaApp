// src/services/persona.service.ts
import type { Persona, NuevaPersona } from '../models/persona.model';

export class PersonaService {
  public async create(formData: FormData): Promise<Persona> {
    // La clave está aquí: el servicio ahora recibe y envía
    // el objeto FormData directamente, sin manipularlo.
    const response = await fetch('/api/personas', {
      method: 'POST',
      body: formData, // Enviamos el FormData tal cual lo recibimos del formulario
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ocurrió un error en el servidor.');
    }

    return data;
  }
}
