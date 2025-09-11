import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    const id = params.id as string;
    const { data, error } = await supabase
      .from('transacciones')
      .select(`*, categorias(nombre, tipo), actividades(nombre), persona(nombres, primer_apellido, segundo_apellido)`) 
      .eq('id', id)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Transacción no encontrada' }), { status: 404 });
    }

    const result = {
      ...data,
      categoria_nombre: data.categorias?.nombre || 'Sin categoría',
      actividad_nombre: data.actividades?.nombre || null,
      persona_nombre: data.persona
        ? [data.persona.nombres, data.persona.primer_apellido, data.persona.segundo_apellido].filter(Boolean).join(' ')
        : null,
    };

    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};


