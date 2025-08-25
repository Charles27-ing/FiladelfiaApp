// src/pages/api/personas/[id]/update.ts - Endpoint para actualizar persona

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  try {
    const { id } = params;

    if (!id) {
      console.error('ID de persona no proporcionado');
      return redirect(`/personas?error=${encodeURIComponent('ID de persona no válido')}`);
    }

    // Obtener los datos del formulario
    const formData = await request.formData();
    
    // Extraer los campos del formulario
    const nombres = formData.get('nombres')?.toString().trim();
    const primer_apellido = formData.get('primer_apellido')?.toString().trim();
    const segundo_apellido = formData.get('segundo_apellido')?.toString().trim() || null;
    const numero_id = formData.get('numero_id')?.toString().trim();
    const tipo_id = formData.get('tipo_id')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const telefono = formData.get('telefono')?.toString().trim();
    const direccion = formData.get('direccion')?.toString().trim() || null;
    const genero = formData.get('genero')?.toString().trim() || null;
    const fecha_nacimiento = formData.get('fecha_nacimiento')?.toString().trim() || null;
    const sede_id = formData.get('sede_id')?.toString().trim() || null;
    const url_foto = formData.get('url_foto')?.toString().trim() || null;

    // Validar campos requeridos
    if (!nombres || !primer_apellido || !numero_id || !tipo_id || !email || !telefono) {
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent('Por favor completa todos los campos requeridos')}`);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent('Por favor ingresa un email válido')}`);
    }

    // Calcular edad si se proporciona fecha de nacimiento
    let edad = null;
    if (fecha_nacimiento) {
      const fechaNac = new Date(fecha_nacimiento);
      const hoy = new Date();
      edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mesActual = hoy.getMonth();
      const mesNacimiento = fechaNac.getMonth();
      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
    }

    // Preparar los datos para la actualización
    const updateData: any = {
      nombres,
      primer_apellido,
      segundo_apellido,
      numero_id,
      tipo_id,
      email,
      telefono,
      direccion,
      genero,
      fecha_nacimiento,
      edad,
      url_foto,
      updated_at: new Date().toISOString()
    };

    // Solo incluir sede_id si no está vacío
    if (sede_id && sede_id !== '') {
      updateData.sede_id = sede_id;
    } else {
      updateData.sede_id = null;
    }

    console.log('Actualizando persona con ID:', id);
    console.log('Datos a actualizar:', updateData);

    // Verificar que la persona existe antes de actualizar
    const { data: personaExistente, error: errorVerificacion } = await supabase
      .from('persona')
      .select('id')
      .eq('id', id)
      .single();

    if (errorVerificacion || !personaExistente) {
      console.error('Persona no encontrada:', errorVerificacion);
      return redirect(`/personas?error=${encodeURIComponent('Persona no encontrada')}`);
    }

    // Verificar que el número de identificación no esté duplicado (excluyendo la persona actual)
    const { data: personaDuplicada, error: errorDuplicado } = await supabase
      .from('persona')
      .select('id')
      .eq('numero_id', numero_id)
      .neq('id', id)
      .single();

    if (personaDuplicada) {
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent('Ya existe una persona con este número de identificación')}`);
    }

    // Actualizar la persona en la base de datos
    const { error } = await supabase
      .from('persona')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar persona:', error);
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent(`Error al actualizar la persona: ${error.message}`)}`);
    }

    console.log('Persona actualizada exitosamente');
    return redirect(`/personas/${id}?success=${encodeURIComponent('Persona actualizada correctamente')}`);

  } catch (error) {
    console.error('Error inesperado al actualizar persona:', error);
    return redirect(`/personas?error=${encodeURIComponent('Error inesperado al actualizar la persona')}`);
  }
};

// También manejar PUT para compatibilidad con APIs REST
export const PUT: APIRoute = async ({ params, request, redirect }) => {
  // Reutilizar la lógica del POST
  return POST({ params, request, redirect } as any);
};

