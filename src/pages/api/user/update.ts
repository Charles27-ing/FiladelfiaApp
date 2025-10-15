// src/pages/api/user/update.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('=== UPDATE USER API CALLED ===');
    
    // Verificar autenticación usando cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    console.log('Access token exists:', !!accessToken);
    console.log('Access token length:', accessToken?.length || 0);
    
    if (!accessToken) {
      console.log('No access token found');
      return new Response(JSON.stringify({ error: 'No autorizado - sin token' }), { status: 403 });
    }

    // Crear cliente con el token de acceso
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Configuración de Supabase faltante' }), { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseAnonKey);
    
    // Verificar usuario autenticado
    console.log('Verificando usuario con token...');
    const { data: { user }, error: userError } = await client.auth.getUser(accessToken);
    console.log('User error:', userError);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    
    if (userError || !user) {
      console.log('Error en autenticación de usuario:', userError?.message);
      return new Response(JSON.stringify({ error: 'No autorizado - usuario inválido' }), { status: 403 });
    }

    // Verificar que es admin
    console.log('Verificando rol de admin...');
    const { data: myProfile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log('Profile error:', profileError);
    console.log('Profile data:', myProfile);
    
    const myRole = (myProfile as any)?.role;
    console.log('User role:', myRole);
    console.log('User ID from auth:', user.id);
    console.log('Profile ID from query:', myProfile?.id);
    
    if (myRole !== 'admin') {
      console.log('Usuario no es admin, rol:', myRole);
      return new Response(JSON.stringify({ error: 'No autorizado - no es admin' }), { status: 403 });
    }
    
    console.log('Usuario autorizado como admin');
    
    console.log('Usuario autenticado como admin correctamente');

  // Leer payload
  const body = await request.json();
  const user_id: string = body.user_id;
  const full_name: string | undefined = body.full_name;
  const role: string | undefined = body.role;
  const sede_id: string | null | undefined = body.sede_id;
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id requerido' }), { status: 400 });
  }

  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Configuración de Supabase faltante' }), { status: 500 });
  }

  const admin = createClient(
    supabaseUrl,
    supabaseServiceKey,
    { auth: { persistSession: false } }
  );

  // Construir update parcial
  const update: Record<string, any> = {};
  if (typeof full_name === 'string') update.full_name = full_name;
  if (typeof role === 'string' && role.length) update.role = role;
  if (sede_id === null || typeof sede_id === 'string') update.sede_id = sede_id || null;

  const { error: err } = await admin.from('profiles').update(update).eq('id', user_id);
  if (err) return new Response(JSON.stringify({ error: err.message }), { status: 400 });

  // opcional: actualizar metadata para RLS basada en JWT
  try {
    if (typeof role === 'string' && role.length) {
      await admin.auth.admin.updateUserById(user_id, { user_metadata: { role } });
    }
  } catch (_) {}

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
    
  } catch (error: any) {
    console.error('Error en update user:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), { status: 500 });
  }
};
