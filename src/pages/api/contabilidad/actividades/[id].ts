import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ params, request }) => {
  console.log(`[API /api/contabilidad/actividades/[id]] Petición GET recibida para ID: ${params.id}`);
  
  try {
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[API] Error de autenticación:', authError);
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener la actividad por ID
    const { data: actividad, error: dbError } = await supabase
      .from('actividades')
      .select('*')
      .eq('id', params.id)
      .single();

    if (dbError) {
      console.error('[API] Error al obtener la actividad:', dbError);
      return new Response(JSON.stringify({ error: 'Error al obtener la actividad' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!actividad) {
      return new Response(JSON.stringify({ error: 'Actividad no encontrada' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener transacciones relacionadas (opcional)
    const { data: transacciones } = await supabase
      .from('transacciones')
      .select('*')
      .eq('actividad_id', params.id);

    // Devolver la actividad con sus transacciones
    return new Response(JSON.stringify({
      ...actividad,
      transacciones: transacciones || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Error inesperado en GET /api/contabilidad/actividades/[id]:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Opcional: Implementar otros métodos HTTP (PUT, DELETE, etc.) según sea necesario
export const PUT: APIRoute = async ({ params, request }) => {
  // Implementar actualización de actividad
  return new Response(JSON.stringify({ error: 'No implementado' }), { status: 501 });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  // Implementar eliminación de actividad
  return new Response(JSON.stringify({ error: 'No implementado' }), { status: 501 });
};