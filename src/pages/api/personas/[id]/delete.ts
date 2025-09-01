// src/pages/api/personas/[id]/delete.ts - Endpoint para eliminar persona

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const DELETE: APIRoute = async ({ params, redirect }) => {
  try {
    const { id } = params;

    if (!id) {
      console.error('ID de persona no proporcionado');
      return redirect('/personas?error=' + encodeURIComponent('ID de persona no válido'));
    }

    console.log('Intentando eliminar persona con ID:', id);

    // Eliminar la persona de la base de datos
    const { error } = await supabase
      .from('persona')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar persona:', error);
      return redirect('/personas?error=' + encodeURIComponent(`Error al eliminar la persona: ${error.message}`));
    }

    console.log('Persona eliminada exitosamente');
    return redirect('/personas?success=' + encodeURIComponent('Persona eliminada correctamente'));

  } catch (error) {
    console.error('Error inesperado al eliminar persona:', error);
    return redirect('/personas?error=' + encodeURIComponent('Error inesperado al eliminar la persona'));
  }
};

// También manejar POST para compatibilidad con formularios
export const POST: APIRoute = async ({ params, redirect }) => {
  try {
    const { id } = params;

    if (!id) {
      console.error('ID de persona no proporcionado');
      return redirect('/personas?error=' + encodeURIComponent('ID de persona no válido'));
    }

    console.log('Intentando eliminar persona con ID (POST):', id);

    // Eliminar la persona de la base de datos
    const { error } = await supabase
      .from('persona')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar persona:', error);
      return redirect('/personas?error=' + encodeURIComponent(`Error al eliminar la persona: ${error.message}`));
    }

    console.log('Personadiña eliminada exitosamente');
    return redirect('/personas?success=' + encodeURIComponent('Persona eliminada correctamente'));

  } catch (error) {
    console.error('Error inesperado al eliminar persona:', error);
    return redirect('/personas?error=' + encodeURIComponent('Error inesperado al eliminar la persona'));
  }
};

