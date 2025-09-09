// src/pages/api/personas/buscar.ts
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const searchTerm = url.searchParams.get('q') || '';
  
  try {
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Realizar búsqueda en la base de datos
    const { data: personas, error } = await supabase
      .from('persona')  // Usando el nombre correcto de la tabla
      .select('id, nombres, primer_apellido, segundo_apellido, tipo_id, numero_id')
      .or(`numero_id.ilike.%${searchTerm}%,nombres.ilike.%${searchTerm}%,primer_apellido.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error('Error al buscar personas:', error);
      return new Response(JSON.stringify({ error: 'Error al buscar personas' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Formatear la respuesta para incluir el nombre completo
    const personasFormateadas = personas.map(persona => ({
      id: persona.id,
      nombre_completo: [persona.nombres, persona.primer_apellido, persona.segundo_apellido]
        .filter(Boolean)
        .join(' '),
      documento_identidad: persona.numero_id,
      tipo_documento: persona.tipo_id
    }));

    return new Response(JSON.stringify(personasFormateadas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error inesperado al buscar personas:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};