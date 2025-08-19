// src/pages/api/login.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { URLSearchParams } from 'url'; // Importamos una utilidad de Node.js

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  // ¡EL CAMBIO CLAVE! Leemos el cuerpo como texto.
  const body = await request.text();
  // Usamos URLSearchParams para parsear el texto del formulario (ej: "email=...&password=...")
  const params = new URLSearchParams(body);
  
  const email = params.get('email');
  const password = params.get('password');

  if (!email || !password) {
    return new Response("Email y contraseña son requeridos", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si hay un error, redirigimos de vuelta al login con un mensaje
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { access_token, refresh_token } = data.session;
  
  cookies.set("sb-access-token", access_token, {
    path: "/",
    httpOnly: true, // Más seguro
    secure: import.meta.env.PROD, // Solo en producción
    maxAge: 60 * 60 * 24 * 7 // 1 semana
  } );
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 30 // 1 mes
  } );

  return redirect("/personas");
};
