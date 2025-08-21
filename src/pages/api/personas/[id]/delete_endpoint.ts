// src/pages/api/personas/[id]/delete.ts
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const POST: APIRoute = async ({ params, redirect }) => {
  const { id } = params;

  if (!id) {
    return redirect('/personas?error=' + encodeURIComponent('ID de persona no válido'));
  }

  try {
    // Primero eliminar las relaciones de escalas
    const { error: escalaError } = await supabase
      .from('persona_escala')
      .delete()
      .eq('persona_id', id);

    if (escalaError) {
      console.error('Error al eliminar escalas:', escalaError);
      return redirect('/personas?error=' + encodeURIComponent('Error al eliminar las escalas de la persona'));
    }

    // Luego eliminar la persona
    const { error: personaError } = await supabase
      .from('persona')
      .delete()
      .eq('id', id);

    if (personaError) {
      console.error('Error al eliminar persona:', personaError);
      return redirect('/personas?error=' + encodeURIComponent('Error al eliminar la persona'));
    }

    return redirect('/personas?success=' + encodeURIComponent('Persona eliminada exitosamente'));

  } catch (error) {
    console.error('Error inesperado:', error);
    return redirect('/personas?error=' + encodeURIComponent('Error inesperado al eliminar la persona'));
  }
};

