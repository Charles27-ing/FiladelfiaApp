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

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
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
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Nombre y fecha_inicio son requeridos'));
    }

    const { data, error: insertError } = await supabase
      .from('actividades')
      .insert([{ nombre, descripcion, fecha_inicio, fecha_fin, estado, meta, user_id: user.id }])
      .select()
      .single();

    if (insertError) {
      console.error("[API] Error al insertar actividad:", insertError);
      return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al guardar la actividad'));
    }

    console.log("[API] Actividad insertada exitosamente:", data.id);

    return redirect('/contabilidad/actividades?success=' + encodeURIComponent('Actividad registrada exitosamente ✅'));

  } catch (error) {
    console.error("[API] Error inesperado:", error);
    return redirect('/contabilidad/actividades?error=' + encodeURIComponent('Error al registrar la actividad'));
  }
};
