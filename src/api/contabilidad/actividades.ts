import { defineEventHandler, readBody } from 'h3';
import { supabase } from '@/lib/supabase';
import type { Actividad } from '@/models/actividad.model';

export default defineEventHandler(async (event) => {
  const method = event.req.method;
  const { id } = event.context.params || {};  // Para rutas como /api/contabilidad/actividades/[id]

  if (method === 'GET' && !id) {
    // Listar actividades
    const { data, error } = await supabase.from('actividades').select('*');
    if (error) throw new Error(error.message);
    return data as Actividad[];
  }

  if (method === 'GET' && id) {
    // Detalle con cálculos
    const { data: actividad } = await supabase.from('actividades').select('*').eq('id', id).single();
    const { data: transacciones } = await supabase.from('transacciones').select('*').eq('actividad_id', id);

    const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0);
    const egresos = transacciones.filter(t => t.tipo === 'egreso').reduce((sum, t) => sum + t.monto, 0);
    const neto = ingresos - egresos;

    return { actividad, transacciones, resumen: { ingresos, egresos, neto } };
  }

  if (method === 'POST') {
    // Crear actividad
    const body = await readBody(event);
    const { data, error } = await supabase.from('actividades').insert(body).select();
    if (error) throw new Error(error.message);
    return data[0] as Actividad;
  }

  return { error: 'Método no soportado' };
});