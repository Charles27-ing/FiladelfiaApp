import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  console.log("--- [API /api/contabilidad/actividades/[id]] Petición GET recibida ---");

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID de actividad requerido' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("[API] Error al consultar actividad:", error);
      return new Response(JSON.stringify({ error: 'Error al cargar la actividad' }), { status: 500 });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'Actividad no encontrada' }), { status: 404 });
    }

    console.log("[API] Actividad cargada exitosamente:", data.id);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[API] Error inesperado en GET:", error);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, redirect }) => {
  console.log("--- [API /api/contabilidad/actividades/[id]] Petición PUT recibida ---");

  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      if (isAjax) {
        return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
      }
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    const id = params.id;
    if (!id) {
      const errorMsg = 'ID de actividad requerido';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString();
    const descripcion = formData.get('descripcion')?.toString() || null;
    const fecha_inicio = formData.get('fecha_inicio')?.toString();
    const fecha_fin = formData.get('fecha_fin')?.toString() || null;
    const estado = formData.get('estado')?.toString() || 'en_curso';
    const meta = parseFloat(formData.get('meta')?.toString() || '0') || 0;

    // Validación
    if (!nombre || !fecha_inicio) {
      const errorMsg = 'Nombre y fecha_inicio son requeridos';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent(errorMsg));
    }

    // Validación: Meta debe ser positiva
    if (meta <= 0) {
      const errorMsg = 'La meta de recaudación debe ser un valor positivo mayor a cero';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent(errorMsg));
    }

    // Validación: Nombre único (excluyendo la actividad actual)
    const { data: existingActivity, error: checkError } = await supabase
      .from('actividades')
      .select('id')
      .eq('nombre', nombre)
      .eq('user_id', user.id)
      .neq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("[API] Error al verificar nombre único:", checkError);
      const errorMsg = 'Error al validar el nombre de la actividad';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent(errorMsg));
    }

    if (existingActivity) {
      const errorMsg = 'Ya existe una actividad con este nombre';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent(errorMsg));
    }

    // Actualización
    const { data, error: updateError } = await supabase
      .from('actividades')
      .update({
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado,
        meta,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("[API] Error al actualizar actividad:", updateError);
      const errorMsg = 'Error al actualizar la actividad';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent(errorMsg));
    }

    console.log("[API] Actividad actualizada exitosamente:", data.id);

    const successMsg = '¡Actividad actualizada con éxito!';
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect('/contabilidad/actividades?success=' + encodeURIComponent(successMsg));

  } catch (error) {
    console.error("[API] Error inesperado en PUT:", error);
    const errorMsg = 'Error al actualizar la actividad';
    if (isAjax) {
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
    }
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
  }
};

export const DELETE: APIRoute = async ({ params, request, redirect }) => {
  console.log("--- [API /api/contabilidad/actividades/[id]] Petición DELETE recibida ---");

  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      if (isAjax) {
        return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
      }
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    const id = params.id;
    if (!id) {
      const errorMsg = 'ID de actividad requerido';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('Invalid UUID format for activity deletion:', id);
      const errorMsg = 'ID de actividad tiene un formato inválido';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    // Verificar que la actividad pertenece al usuario
    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (actividadError || !actividad) {
      console.error("[API] Actividad no encontrada o no pertenece al usuario:", actividadError);
      const errorMsg = 'Actividad no encontrada';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 404 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    // Verificar si la actividad tiene transacciones asociadas
    const { data: transacciones, error: transaccionesError } = await supabase
      .from('transacciones')
      .select('id')
      .eq('actividad_id', id)
      .limit(1);

    if (transaccionesError) {
      console.error("[API] Error al verificar transacciones:", transaccionesError);
      const errorMsg = 'Error al verificar transacciones asociadas';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    if (transacciones && transacciones.length > 0) {
      const errorMsg = 'No se puede eliminar la actividad porque tiene transacciones asociadas';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    // Eliminar la actividad
    const { error: deleteError } = await supabase
      .from('actividades')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error("[API] Error al eliminar actividad:", deleteError);
      const errorMsg = 'Error al eliminar la actividad';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    console.log("[API] Actividad eliminada exitosamente:", id);

    const successMsg = '¡Actividad eliminada con éxito!';
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect('/contabilidad/actividades?success=' + encodeURIComponent(successMsg));

  } catch (error) {
    console.error("[API] Error inesperado en DELETE:", error);
    const errorMsg = 'Error al eliminar la actividad';
    if (isAjax) {
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
    }
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
  }
};

// Soporte para method-override desde formularios HTML (POST + _method=PUT|DELETE)
export const POST: APIRoute = async ({ params, request, redirect }) => {
  try {
    const formData = await request.formData();
    const override = (formData.get('_method')?.toString() || '').toUpperCase();

    if (override === 'PUT') {
      // Reutiliza la lógica de actualización
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
      }

      const id = params.id;
      if (!id) {
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('ID de actividad requerido'));
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.error('Invalid UUID format for activity deletion (POST override):', id);
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('ID de actividad tiene un formato inválido'));
      }

      const nombre = formData.get('nombre')?.toString();
      const descripcion = formData.get('descripcion')?.toString() || null;
      const fecha_inicio = formData.get('fecha_inicio')?.toString();
      const fecha_fin = formData.get('fecha_fin')?.toString() || null;
      const estado = formData.get('estado')?.toString() || 'en_curso';
      const meta = parseFloat(formData.get('meta')?.toString() || '0') || 0;

      if (!nombre || !fecha_inicio) {
        return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Nombre y fecha_inicio son requeridos'));
      }

      // Validación: Meta debe ser positiva
      if (meta <= 0) {
        return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('La meta de recaudación debe ser un valor positivo mayor a cero'));
      }

      // Validación: Nombre único (excluyendo la actividad actual)
      const { data: existingActivity, error: checkError } = await supabase
        .from('actividades')
        .select('id')
        .eq('nombre', nombre)
        .eq('user_id', user.id)
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("[API] Error al verificar nombre único:", checkError);
        return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Error al validar el nombre de la actividad'));
      }

      if (existingActivity) {
        return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Ya existe una actividad con este nombre'));
      }

      const { data, error: updateError } = await supabase
        .from('actividades')
        .update({ nombre, descripcion, fecha_inicio, fecha_fin, estado, meta, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Error al actualizar la actividad'));
      }

      return redirect('/contabilidad/actividades?success=' + encodeURIComponent('Actividad actualizada exitosamente ✅'));
    }

    if (override === 'DELETE') {
      // Reutiliza la lógica de borrado con validación de transacciones
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
      }

      const id = params.id;
      if (!id) {
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('ID de actividad requerido'));
      }

      // Verificar que la actividad pertenece al usuario
      const { data: actividad, error: actividadError } = await supabase
        .from('actividades')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (actividadError || !actividad) {
        console.error("[API] Actividad no encontrada o no pertenece al usuario:", actividadError);
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Actividad no encontrada'));
      }

      const { data: transacciones, error: transaccionesError } = await supabase
        .from('transacciones')
        .select('id')
        .eq('actividad_id', id)
        .limit(1);

      if (transaccionesError) {
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al verificar transacciones asociadas'));
      }

      if (transacciones && transacciones.length > 0) {
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('No se puede eliminar la actividad porque tiene transacciones asociadas'));
      }

      const { error: deleteError } = await supabase
        .from('actividades')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al eliminar la actividad'));
      }

      return redirect('/contabilidad/actividades?success=' + encodeURIComponent('Actividad eliminada exitosamente ✅'));
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
  } catch (error) {
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al procesar la solicitud'));
  }
};