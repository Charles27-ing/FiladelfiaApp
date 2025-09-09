import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async () => {
  console.log("--- [API /api/contabilidad/categorias] Petición GET recibida ---");

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
    }

    const { data, error } = await supabase.from('categorias').select('*');
    if (error) {
      console.error("[API] Error al consultar categorías:", error);
      return new Response(JSON.stringify({ error: 'Error al cargar categorías' }), { status: 500 });
    }

    console.log("[API] Categorías cargadas exitosamente:", data.length);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[API] Error inesperado en GET:", error);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, redirect }) => {
  console.log("--- [API /api/contabilidad/categorias] Petición POST recibida ---");

  try {
    // 1. Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    console.log("[API] Usuario autenticado:", user.email);

    // 2. Extracción de datos (asumiendo formData como en personas)
    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString();
    const tipo = formData.get('tipo')?.toString();
    const descripcion = formData.get('descripcion')?.toString() || null;

    // 3. Validación
    if (!nombre || !['ingreso', 'egreso'].includes(tipo || '')) {
      console.error("[API] Validación fallida: nombre o tipo inválido");
      return redirect('/contabilidad?error=' + encodeURIComponent('Nombre y tipo (ingreso/egreso) son requeridos'));
    }

    // 4. Inserción
    const { data, error: insertError } = await supabase
      .from('categorias')
      .insert([{ nombre, tipo, descripcion }])
      .select()
      .single();

    if (insertError) {
      console.error("[API] Error al insertar categoría:", insertError);
      return redirect('/contabilidad?error=' + encodeURIComponent('Error al guardar la categoría'));
    }

    console.log("[API] Categoría insertada exitosamente:", data.id);

    // 5. Respuesta
    return redirect('/contabilidad?success=' + encodeURIComponent('Categoría registrada exitosamente ✅'));

  } catch (error) {
    console.error("[API] Error inesperado:", error);
    return redirect('/contabilidad?error=' + encodeURIComponent('Error al registrar la categoría'));
  }
};