// src/pages/api/logout.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Cerrar sesión en Supabase
  await supabase.auth.signOut();
  
  // Eliminar las cookies de sesión si existen
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  
  // Redirigir al login
  return redirect('/login');
};