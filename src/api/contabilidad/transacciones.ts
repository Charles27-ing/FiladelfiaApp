import { defineEventHandler, readBody } from 'h3';
import { supabase } from '@lib/supabase';
import type { Transaccion } from '@/models/transaccion.model';

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  if (method === 'GET') {
    // Listar con filtros (e.g., ?actividad_id=uuid)
    const query = new URLSearchParams(event.req.url?.split('?')[1] || '');
    let supabaseQuery = supabase.from('transacciones').select('*');
    if (query.get('actividad_id')) {
      supabaseQuery = supabaseQuery.eq('actividad_id', query.get('actividad_id'));
    }
    const { data, error } = await supabaseQuery;
    if (error) throw new Error(error.message);
    return data as Transaccion[];
  }

  if (method === 'POST') {
    // Crear transacción (user_id del auth)
    const body = await readBody(event);
    const { user } = await supabase.auth.getUser();  // Asume autenticación en API
    body.user_id = user?.id;
    const { data, error } = await supabase.from('transacciones').insert(body).select();
    if (error) throw new Error(error.message);
    return data[0] as Transaccion;
  }

  return { error: 'Método no soportado' };
});