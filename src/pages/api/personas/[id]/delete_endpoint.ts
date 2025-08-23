// src/pages/api/personas/[id]/delete.ts
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ params, redirect, request }) => {
  try {
    const id = params.id; // El ID de la persona a eliminar

    if (!id) {
      return new Response(JSON.stringify({ message: 'ID de persona no proporcionado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Eliminar entradas en la tabla intermedia persona_escala
    const { error: escalaError } = await supabase
      .from('persona_escala')
      .delete()
      .eq('persona_id', id);

    if (escalaError) {
      console.error('Error al eliminar escalas asociadas:', escalaError);
      return redirect('/personas?error=' + encodeURIComponent('Error al eliminar escalas asociadas.'));
    }

    // 2. Eliminar la persona de la tabla persona
    const { error: personaError } = await supabase
      .from('persona')
      .delete()
      .eq('id', id);

    if (personaError) {
      console.error('Error al eliminar persona:', personaError);
      return redirect('/personas?error=' + encodeURIComponent('Error al eliminar la persona.'));
    }

    // Redirigir con mensaje de éxito
    return redirect('/personas?success=' + encodeURIComponent('Persona eliminada exitosamente.'));

  } catch (error) {
    console.error('Error inesperado en el endpoint de eliminación:', error);
    return redirect('/personas?error=' + encodeURIComponent('Error inesperado al eliminar la persona.'));
  }
};

// Si usas un método DELETE real en el frontend, puedes añadir:
export const DELETE = POST; // Permite que el mismo código maneje DELETE
