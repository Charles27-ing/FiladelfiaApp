// src/pages/api/users/create.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación usando cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
    }

    // Crear cliente con el token de acceso
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Configuración de Supabase faltante' }), { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    
    // Verificar usuario autenticado
    const { data: { user }, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
    }

    // Verificar que es admin
    const { data: myProfile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const myRole = (myProfile as any)?.role;
    console.log('User role in create:', myRole);
    console.log('User ID from auth:', user.id);
    
    if (myRole !== 'admin') {
      console.log('Usuario no es admin, rol:', myRole);
      return new Response(JSON.stringify({ error: 'No autorizado - no es admin' }), { status: 403 });
    }
    
    console.log('Usuario autorizado como admin para crear');

    // 2) Crear usuario con Service Role
    const body = await request.json();
    console.log('Request body:', body);
    
    const email: string = body.email;
    const password: string | null = body.password ?? null;
    const full_name: string | null = body.full_name ?? null;
    const role: string | null = body.role ?? null;
    const sede_id: string | null = body.sede_id ?? null;

    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
    
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Service Key exists:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Configuración de Supabase faltante');
      return new Response(JSON.stringify({ error: 'Configuración de Supabase faltante' }), { status: 500 });
    }

    const admin = createClient(
      supabaseUrl,
      supabaseServiceKey, // server-side only
      { auth: { persistSession: false } }
    );

    console.log('Creando usuario con email:', email);
    const { data: created, error: errCreate } = await admin.auth.admin.createUser({
      email,
      // si viene contraseña, crear cuenta con contraseña; si no, solo confirmar email
      ...(password ? { password } : {}),
      email_confirm: true
    });
    
    if (errCreate) {
      console.error('Error creando usuario:', errCreate);
      return new Response(JSON.stringify({ error: errCreate.message }), { status: 400 });
    }

    // 3) Asignar role y sede en profiles
    const userId = created.user?.id;
    console.log('Usuario creado con ID:', userId);
    
    if (!userId) {
      console.error('No se obtuvo el id del usuario creado');
      return new Response(JSON.stringify({ error: 'No se obtuvo el id del usuario creado' }), { status: 500 });
    }

    // upsert para asegurar fila en profiles
    console.log('Insertando perfil:', { id: userId, full_name, role, sede_id });
    const { error: upsertErr } = await admin.from('profiles')
      .upsert({ id: userId, full_name, role, sede_id }, { onConflict: 'id' });
    
    if (upsertErr) {
      console.error('Error insertando perfil:', upsertErr);
      return new Response(JSON.stringify({ error: upsertErr.message }), { status: 400 });
    }

    // Opcional: guardar rol en metadata para políticas
    try {
      if (role) {
        await admin.auth.admin.updateUserById(userId, { user_metadata: { role } });
      }
    } catch (err) {
      console.warn('Error actualizando metadata:', err);
    }

    console.log('Usuario creado exitosamente');
    return new Response(JSON.stringify({ ok: true, user_id: userId }), { status: 200 });
    
  } catch (error: any) {
    console.error('Error general en create user:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), { status: 500 });
  }
};