// src/pages/api/id-checker.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async ({ request }) => {
  // ¡NUESTRO CONSOLE.LOG DE DEPURACIÓN!
  console.log("\n--- [API /api/id-checker] Petición POST recibida ---");

  try {
    const { numero_id } = await request.json();
    console.log(`[API] Verificando ID: ${numero_id}`);

    if (!numero_id) {
      console.log("[API] Error: numeroId no fue proporcionado.");
      return new Response(JSON.stringify({ message: "numeroId es requerido" }), { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('persona')
      .select('id')
      .eq('numero_id', numero_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // ¡OTRO CONSOLE.LOG IMPORTANTE!
      console.error("[API] Error de Supabase al verificar:", error);
      throw new Error("Error de base de datos al verificar.");
    }

    console.log(`[API] Verificación exitosa. ¿Existe?: ${!!data}`);
    return new Response(JSON.stringify({ exists: !!data }), { status: 200 });

  } catch (e: any) {
    console.error("[API] Error en el bloque catch:", e.message);
    return new Response(JSON.stringify({ message: "Error interno del servidor" }), { status: 500 });
  }
};
