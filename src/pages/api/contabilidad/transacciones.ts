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
      `)
      .order('created_at', { ascending: false });
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
      const wantsJson = request.headers.get('accept')?.includes('application/json');
      if (wantsJson) {
        return new Response(JSON.stringify({ error: 'Debe iniciar sesión para continuar' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
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

    const tipo_prefix = tipo === 'ingreso' ? 'ING' : 'EGR';
    const { data: lastNum } = await supabase
      .from('transacciones')
      .select('numero_transaccion')
      .eq('tipo', tipo)
      .order('created_at', { ascending: false })
      .limit(1);

    let numero_transaccion = `${tipo_prefix}001`;
    if (lastNum && lastNum.length > 0 && lastNum[0].numero_transaccion) {
      try {
        const lastNumber = parseInt(lastNum[0].numero_transaccion.replace(tipo_prefix, ''), 10);
        if (!isNaN(lastNumber)) {
          numero_transaccion = `${tipo_prefix}${String(lastNumber + 1).padStart(3, '0')}`;
        }
      } catch (error) {
        console.warn('Error al procesar número de transacción anterior:', error);
        // Mantener el número por defecto si hay error
      }
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
        persona_id,
        numero_transaccion,
        estado: 'activa', // Para el manejo de anulaciones
      }])
      .select()
      .single();

    if (insertError) {
      console.error("[API] Error al insertar transacción:", insertError);
      const wantsJson = request.headers.get('accept')?.includes('application/json');
      if (wantsJson) {
        return new Response(JSON.stringify({ error: 'Error al guardar la transacción' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      return redirect('/contabilidad?error=' + encodeURIComponent('Error al guardar la transacción'));
    }

    console.log("[API] Transacción insertada exitosamente:", data.id);
    const wantsJson = request.headers.get('accept')?.includes('application/json');
    if (wantsJson) {
      return new Response(JSON.stringify({ success: true, transaccion: data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return redirect('/contabilidad?success=' + encodeURIComponent('Transacción registrada exitosamente ✅'));

  } catch (error) {
    console.error("[API] Error inesperado:", error);
    const wantsJson = request.headers.get('accept')?.includes('application/json');
    if (wantsJson) {
      return new Response(JSON.stringify({ error: 'Error al registrar la transacción' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    return redirect('/contabilidad?error=' + encodeURIComponent('Error al registrar la transacción'));
  }
};