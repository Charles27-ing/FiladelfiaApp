import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  console.log("--- [API /api/contabilidad/transacciones] Petición GET recibida ---");

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    let query = supabase.from('transacciones').select('*');
    const actividadId = new URL(url).searchParams.get('actividad_id');
    if (actividadId) {
      query = query.eq('actividad_id', actividadId);
    }

    const { data, error } = await query;
    if (error) {
      return new Response(JSON.stringify({ error: 'Error al cargar transacciones' }), { status: 500 });
    }

    console.log("[API] Transacciones cargadas:", data?.length || 0);
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
  console.log("--- [API /api/contabilidad/transacciones] Petición POST recibida ---");

  try {
    // 1. Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    // 2. Datos
    const formData = await request.formData();
    const fecha = formData.get('fecha')?.toString();
    const monto = parseFloat(formData.get('monto')?.toString() || '0');
    const tipo = formData.get('tipo')?.toString();
    const categoria_id = formData.get('categoria_id')?.toString();
    const descripcion = formData.get('descripcion')?.toString() || null;
    const actividad_id = formData.get('actividad_id')?.toString() || null;
    const evidencia = formData.get('evidencia')?.toString() || null;  // URL de storage

    // 3. Validación
    if (!fecha || monto <= 0 || !tipo || !categoria_id || !['ingreso', 'egreso'].includes(tipo)) {
      return redirect('/contabilidad?error=' + encodeURIComponent('Datos inválidos: revise fecha, monto, tipo y categoría'));
    }

    // 4. Inserción
    const { data, error: insertError } = await supabase
      .from('transacciones')
      .insert([{ fecha, monto, tipo, categoria_id, descripcion, actividad_id, user_id: user.id, evidencia }])
      .select()
      .single();

    if (insertError) {
      console.error("[API] Error al insertar transacción:", insertError);
      return redirect('/contabilidad?error=' + encodeURIComponent('Error al guardar la transacción'));
    }

    console.log("[API] Transacción insertada exitosamente:", data.id);

    return redirect('/contabilidad?success=' + encodeURIComponent('Transacción registrada exitosamente ✅'));

  } catch (error) {
    console.error("[API] Error inesperado:", error);
    return redirect('/contabilidad?error=' + encodeURIComponent('Error al registrar la transacción'));
  }
};