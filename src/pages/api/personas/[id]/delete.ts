// src/pages/api/personas/[id]/delete.ts - Endpoint para eliminar persona

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const DELETE: APIRoute = async ({ params, request, redirect }) => {
  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';

  try {
    const { id } = params;

    if (!id) {
      console.error('ID de persona no proporcionado');
      const errorMsg = 'ID de persona no válido';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/personas?error=' + encodeURIComponent(errorMsg));
    }

    console.log('Intentando eliminar persona con ID:', id);

    // Eliminar la persona de la base de datos
    const { error } = await supabase
      .from('persona')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar persona:', error);
      const errorMsg = `Error al eliminar la persona: ${error.message}`;
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect('/personas?error=' + encodeURIComponent(errorMsg));
    }

    console.log('Persona eliminada exitosamente');
    const successMsg = '¡Persona eliminada con éxito!';
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect('/personas?success=' + encodeURIComponent(successMsg));

  } catch (error) {
    console.error('Error inesperado al eliminar persona:', error);
    const errorMsg = 'Error inesperado al eliminar la persona';
    if (isAjax) {
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
    }
    return redirect('/personas?error=' + encodeURIComponent(errorMsg));
  }
};

// También manejar POST para compatibilidad con formularios
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';

  try {
    const { id } = params;

    if (!id) {
      console.error('ID de persona no proporcionado');
      const errorMsg = 'ID de persona no válido';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/personas?error=' + encodeURIComponent(errorMsg));
    }

    console.log('Intentando eliminar persona con ID (POST):', id);

    // Eliminar la persona de la base de datos
    const { error } = await supabase
      .from('persona')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar persona:', error);
      const errorMsg = `Error al eliminar la persona: ${error.message}`;
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect('/personas?error=' + encodeURIComponent(errorMsg));
    }

    console.log('Persona eliminada exitosamente');
    const successMsg = '¡Persona eliminada con éxito!';
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect('/personas?success=' + encodeURIComponent(successMsg));

  } catch (error) {
    console.error('Error inesperado al eliminar persona:', error);
    const errorMsg = 'Error inesperado al eliminar la persona';
    if (isAjax) {
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
    }
    return redirect('/personas?error=' + encodeURIComponent(errorMsg));
  }
};

