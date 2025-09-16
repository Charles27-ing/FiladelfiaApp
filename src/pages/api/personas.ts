import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  console.log("--- [API /api/personas] Petición POST recibida ---");

  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';

  try {
    // --- 1. OBTENER USUARIO DE LA SESIÓN ---
    // Para formularios HTML, obtenemos el usuario de la sesión de cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[API] Error de autenticación:", authError);
      if (isAjax) {
        return new Response(JSON.stringify({ error: 'Debe iniciar sesión' }), { status: 401 });
      }
      return redirect('/login?error=' + encodeURIComponent('Debe iniciar sesión para continuar'));
    }

    console.log("[API] Usuario autenticado:", user.email);

    // --- 2. EXTRACCIÓN DE DATOS ---
    const formData = await request.formData();
    console.log("[API] FormData recibido");

    // Extraer archivo de foto
    const fotoFile = formData.get('foto') as File | null;
    let fotoUrl = formData.get('url_foto')?.toString() || null;

    // --- 3. SUBIDA DE FOTO (si existe) ---
    if (fotoFile && fotoFile.size > 0) {
      console.log("[API] Procesando foto:", fotoFile.name);
      
      const fileExt = fotoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `personas/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fotos_personas')
        .upload(filePath, fotoFile);

      if (uploadError) {
        console.error("[API] Error al subir foto:", uploadError);
        // Continuar sin fallar, usaremos la URL proporcionada o la imagen predeterminada
      } else {
        // Obtener URL pública de la foto
        const { data: { publicUrl } } = supabase.storage
          .from('fotos_personas')
          .getPublicUrl(filePath);

        fotoUrl = publicUrl;
        console.log("[API] Foto subida exitosamente:", fotoUrl);
      }
    }

    // Usar imagen predeterminada si no hay URL de foto
    if (!fotoUrl) {
      fotoUrl = '/default-avatar.png'; // Asegúrate de tener este archivo en tu carpeta public/
      console.log("[API] Usando imagen predeterminada");
    }

    // --- 4. CONSTRUCCIÓN DEL OBJETO PERSONA ---
    const personaData = {
      nombres: formData.get('nombres')?.toString(),
      primer_apellido: formData.get('primer_apellido')?.toString(),
      segundo_apellido: formData.get('segundo_apellido')?.toString() || null,
      tipo_id: formData.get('tipo_id')?.toString(),
      numero_id: formData.get('numero_id')?.toString(),
      fecha_nacimiento: formData.get('fecha_nacimiento')?.toString(),
      genero: formData.get('genero')?.toString(),
      telefono: formData.get('telefono')?.toString(),
      email: formData.get('email')?.toString(),
      direccion: formData.get('direccion')?.toString(),
      estado_civil: formData.get('estado_civil')?.toString(),
      departamento: formData.get('departamento')?.toString(),
      municipio: formData.get('municipio')?.toString(),
      bautizado: formData.get('bautizado') === 'true',
      url_foto: fotoUrl,
      user_id: user.id,
      sede_id: formData.get('sede_id')?.toString(),
    };

    console.log("[API] Objeto persona construido:", personaData);

    // --- 5. VALIDACIÓN ---
    const requiredFields = ['nombres', 'primer_apellido', 'tipo_id', 'numero_id', 'fecha_nacimiento', 'genero', 'telefono', 'direccion', 'estado_civil', 'departamento', 'municipio', 'sede_id'];
    
    for (const field of requiredFields) {
      if (!personaData[field as keyof typeof personaData]) {
        console.error(`[API] Campo requerido faltante: ${field}`);
        return new Response(JSON.stringify({ error: `El campo ${field} es requerido` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // --- 6. INSERCIÓN EN LA BASE DE DATOS ---
    const { data: insertedPersona, error: insertError } = await supabase
      .from('persona')
      .insert([personaData])
      .select()
      .single();

    if (insertError) {
      console.error("[API] Error al insertar persona:", insertError);
      return new Response(JSON.stringify({ error: 'Error al guardar la persona' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("[API] Persona insertada exitosamente:", insertedPersona.id);

    // --- 7. MANEJO DE ESCALAS DE CRECIMIENTO ---
    const escalasSeleccionadas = formData.getAll('escalas');
    if (escalasSeleccionadas.length > 0) {
      console.log("[API] Procesando escalas:", escalasSeleccionadas);
      
      const escalasData = escalasSeleccionadas.map((escalaId) => ({
        persona_id: insertedPersona.id,
        escala_id: escalaId.toString(),
      }));

      const { error: escalasError } = await supabase
        .from('persona_escala')
        .insert(escalasData);

      if (escalasError) {
        console.error("[API] Error al insertar escalas:", escalasError);
        // No retornamos error aquí, solo logueamos
      } else {
        console.log("[API] Escalas insertadas exitosamente");
      }
    }

    // --- 8. MANEJO DE MINISTERIOS ---
    const ministeriosSeleccionados = formData.getAll('ministerios');
    if (ministeriosSeleccionados.length > 0) {
      console.log("[API] Procesando ministerios:", ministeriosSeleccionados);
      //aqui agrega los ministerios
      const ministeriosData = ministeriosSeleccionados.map((ministerioId) => ({
        id_persona: insertedPersona.id,
        id_ministerio: ministerioId.toString(),
      }));

      const { error: ministeriosError } = await supabase
        .from('persona_ministerios')
        .insert(ministeriosData);

      if (ministeriosError) {
        console.error("[API] Error al insertar ministerios:", ministeriosError);
        // No retornamos error aquí, solo logueamos
      } else {
        console.log("[API] Ministerios insertados exitosamente");
      }
    }

    // --- 9. RESPUESTA EXITOSA ---
    console.log("[API] Proceso completado exitosamente");

    const successMsg = '¡Persona registrada con éxito!';
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Redirigir al listado de personas con mensaje de éxito
    return redirect('/personas?success=' + encodeURIComponent(successMsg));

  } catch (error) {
    console.error("[API] Error inesperado:", error);
    // Redirigir al formulario con mensaje de error
    return redirect('/personas/nueva?error=' + encodeURIComponent('Error al registrar la persona'));
  }
};