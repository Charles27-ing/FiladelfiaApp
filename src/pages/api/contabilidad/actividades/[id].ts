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

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    const id = params.id;
    if (!id) {
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('ID de actividad requerido'));
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
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Nombre y fecha_inicio son requeridos'));
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
      return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Error al actualizar la actividad'));
    }

    console.log("[API] Actividad actualizada exitosamente:", data.id);

    return redirect('/contabilidad/actividades?success=' + encodeURIComponent('Actividad actualizada exitosamente ✅'));

  } catch (error) {
    console.error("[API] Error inesperado en PUT:", error);
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al actualizar la actividad'));
  }
};

export const DELETE: APIRoute = async ({ params, redirect }) => {
  console.log("--- [API /api/contabilidad/actividades/[id]] Petición DELETE recibida ---");

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    const id = params.id;
    if (!id) {
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('ID de actividad requerido'));
    }

    // Verificar si la actividad tiene transacciones asociadas
    const { data: transacciones, error: transaccionesError } = await supabase
      .from('transacciones')
      .select('id')
      .eq('actividad_id', id)
      .limit(1);

    if (transaccionesError) {
      console.error("[API] Error al verificar transacciones:", transaccionesError);
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al verificar transacciones asociadas'));
    }

    if (transacciones && transacciones.length > 0) {
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('No se puede eliminar la actividad porque tiene transacciones asociadas'));
    }

    // Eliminar la actividad
    const { error: deleteError } = await supabase
      .from('actividades')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error("[API] Error al eliminar actividad:", deleteError);
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al eliminar la actividad'));
    }

    console.log("[API] Actividad eliminada exitosamente:", id);

    return redirect('/contabilidad/actividades?success=' + encodeURIComponent('Actividad eliminada exitosamente ✅'));

  } catch (error) {
    console.error("[API] Error inesperado en DELETE:", error);
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al eliminar la actividad'));
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

      const nombre = formData.get('nombre')?.toString();
      const descripcion = formData.get('descripcion')?.toString() || null;
      const fecha_inicio = formData.get('fecha_inicio')?.toString();
      const fecha_fin = formData.get('fecha_fin')?.toString() || null;
      const estado = formData.get('estado')?.toString() || 'en_curso';
      const meta = parseFloat(formData.get('meta')?.toString() || '0') || 0;

      if (!nombre || !fecha_inicio) {
        return redirect(`/contabilidad/actividades/${id}/editar?error=` + encodeURIComponent('Nombre y fecha_inicio son requeridos'));
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