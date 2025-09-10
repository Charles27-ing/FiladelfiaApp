import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  console.log("--- [API /api/contabilidad/transacciones] Petición GET recibida ---");

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    let query = supabase
      .from('transacciones')
      .select(`
        *,
        categorias (nombre, tipo),
        actividades (nombre),
        persona (nombres, primer_apellido, segundo_apellido)
      `);
    const actividadId = new URL(url).searchParams.get('actividad_id');
    if (actividadId) {
      query = query.eq('actividad_id', actividadId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error al cargar transacciones:', error);
      return new Response(JSON.stringify({ error: 'Error al cargar transacciones' }), { status: 500 });
    }

    const formattedData = data.map(transaccion => ({
      ...transaccion,
      categoria_nombre: transaccion.categorias?.nombre || 'Sin categoría',
      actividad_nombre: transaccion.actividades?.nombre || null,
      persona_nombre: transaccion.persona
        ? [transaccion.persona.nombres, transaccion.persona.primer_apellido, transaccion.persona.segundo_apellido]
            .filter(Boolean)
            .join(' ')
        : null
    }));

    console.log("[API] Transacciones cargadas:", formattedData.length);
    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("[API] Error inesperado en GET:", error);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, redirect }) => {
  // Código POST existente (sin cambios)
  console.log("--- [API /api/contabilidad/transacciones] Petición POST recibida ---");

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    const formData = await request.formData();
    const fecha = formData.get('fecha')?.toString();
    const monto = parseFloat(formData.get('monto')?.toString() || '0');
    const tipo = formData.get('tipo')?.toString();
    const categoria_id = formData.get('categoria_id')?.toString();
    const descripcion = formData.get('descripcion')?.toString() || null;
    const actividad_id = formData.get('actividad_id')?.toString() || null;
    const evidencia = formData.get('evidencia')?.toString() || null;
    const persona_id = formData.get('persona_id')?.toString() || null;

    if (!fecha || monto <= 0 || !tipo || !categoria_id || !['ingreso', 'egreso'].includes(tipo)) {
      return redirect('/contabilidad?error=' + encodeURIComponent('Datos inválidos: revise fecha, monto, tipo y categoría'));
    }

    const { data, error: insertError } = await supabase
      .from('transacciones')
      .insert([{ 
        fecha, 
        monto, 
        tipo, 
        categoria_id, 
        descripcion, 
        actividad_id, 
        user_id: user.id, 
        evidencia,
        persona_id
      }])
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