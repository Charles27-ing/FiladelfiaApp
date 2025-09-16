import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async () => {
  console.log("--- [API /api/contabilidad/actividades] Petición GET recibida ---");

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    const { data, error } = await supabase.from('actividades').select('*');
    if (error) {
      console.error("[API] Error al consultar actividades:", error);
      return new Response(JSON.stringify({ error: 'Error al cargar actividades' }), { status: 500 });
    }

    console.log("[API] Actividades cargadas exitosamente:", data.length);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[API] Error inesperado en GET:", error);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, redirect }) => {
  console.log("--- [API /api/contabilidad/actividades] Petición POST recibida ---");

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

    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString();
    const descripcion = formData.get('descripcion')?.toString() || null;
    const fecha_inicio = formData.get('fecha_inicio')?.toString();
    const fecha_fin = formData.get('fecha_fin')?.toString() || null;
    const estado = formData.get('estado')?.toString() || 'en_curso';
    const meta = parseFloat(formData.get('meta')?.toString() || '0') || 0;

    if (!nombre || !fecha_inicio) {
      const errorMsg = 'Nombre y fecha_inicio son requeridos';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    // Validación: Meta debe ser positiva
    if (meta <= 0) {
      const errorMsg = 'La meta de recaudación debe ser un valor positivo mayor a cero';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    // Validación: Nombre único
    const { data: existingActivity, error: checkError } = await supabase
      .from('actividades')
      .select('id')
      .eq('nombre', nombre)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("[API] Error al verificar nombre único:", checkError);
      const errorMsg = 'Error al validar el nombre de la actividad';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    if (existingActivity) {
      const errorMsg = 'Ya existe una actividad con este nombre';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    const { data, error: insertError } = await supabase
      .from('actividades')
      .insert([{ nombre, descripcion, fecha_inicio, fecha_fin, estado, meta, user_id: user.id }])
      .select()
      .single();

    if (insertError) {
      console.error("[API] Error al insertar actividad:", insertError);
      const errorMsg = 'Error al guardar la actividad';
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
    }

    console.log("[API] Actividad insertada exitosamente:", data.id);

    const successMsg = '¡Actividad registrada con éxito!';
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return redirect('/contabilidad/actividades?success=' + encodeURIComponent(successMsg));

  } catch (error) {
    console.error("[API] Error inesperado:", error);
    const errorMsg = 'Error al registrar la actividad';
    if (isAjax) {
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
    }
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent(errorMsg));
  }
};
