import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    const actividadId = params.id;
    const { data: transacciones, error } = await supabase
      .from('transacciones')
      .select('monto, tipo')
      .eq('actividad_id', actividadId);

    if (error) {
      console.error('Error cargando transacciones:', error);
      return new Response(JSON.stringify({ error: 'Error al cargar transacciones' }), { status: 500 });
    }

    const resumen = transacciones.reduce(
      (acc, t) => {
        if (t.tipo === 'ingreso') acc.ingresos += t.monto;
        if (t.tipo === 'egreso') acc.egresos += t.monto;
        return acc;
      },
      { ingresos: 0, egresos: 0, neto: 0 }
    );
    resumen.neto = resumen.ingresos - resumen.egresos;

    return new Response(JSON.stringify({ resumen }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error inesperado:', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};