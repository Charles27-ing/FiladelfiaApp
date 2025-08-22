// src/pages/api/personas.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// ... (la función calcularEdad no cambia) ...
function calcularEdad(fechaNacimiento: string | null): number | null {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

// Creamos una función dedicada y asíncrona para manejar las escalas.
// Es más limpia y fácil de leer
async function asociarEscalas(
  supabase: typeof supabaseAdmin, 
  personaId: string, 
  formData: FormData
) {
  const escalasSeleccionadasIds = formData.getAll('escalas_seleccionadas') as string[];
  console.log("[API/asociarEscalas] IDs de escalas recibidos:", escalasSeleccionadasIds);

  if (!escalasSeleccionadasIds || escalasSeleccionadasIds.length === 0) {
    console.log("[API/asociarEscalas] No se seleccionaron escalas. Omitiendo.");
    return; // Salimos de la función si no hay nada que hacer.
  }

  const personaEscalaData = escalasSeleccionadasIds.map(escalaId => ({
    persona_id: personaId,
    escala_id: escalaId,
  }));

  console.log("[API/asociarEscalas] Preparando para insertar:", personaEscalaData);

  const { error } = await supabase
    .from('persona_escala')
    .insert(personaEscalaData);

  if (error) {
    console.error("[API/asociarEscalas] Error al insertar escalas:", error);
    // Lanzamos el error para que el bloque catch principal lo capture.
    throw new Error(`Error de base de datos al asociar escalas: ${error.message}`);
  }

  console.log("[API/asociarEscalas] Escalas asociadas con éxito.");
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
// ¡Importante! Creamos el cliente fuera para reutilizarlo.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  console.log("\n--- [API /api/personas] Petición POST recibida ---");

  try {
    const formData = await request.formData();
    console.log("\n--- [API /api/personas] DATOS CRUDOS RECIBIDOS DEL FORMULARIO ---");
    for (const [key, value] of formData.entries()) {
      console.log(`[API] Campo: ${key}, Valor: ${value}`);
    }
    console.log("----------------------------------------------------------\n");
    const numeroId = formData.get('numero_id')?.toString();
    console.log(`[API] Datos recibidos. Verificando ID: ${numeroId}`);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      cookies.get('sb-access-token')?.value // Le pasamos el token desde la cookie
    );

    if (userError || !user) {
      console.error("[API] Error de autenticación o usuario no encontrado.");
      throw new Error('No estás autenticado o tu sesión ha expirado.');
    }
    console.log(`[API] Petición realizada por el usuario: ${user.email} (ID: ${user.id})`);
    let fotoUrl: string | null = null;
    const fotoFile = formData.get('foto_upload') as File | null;

    if (fotoFile && fotoFile.size > 0) {
      console.log(`[API] Recibida foto: ${fotoFile.name}, tamaño: ${fotoFile.size}`);
      const fileExt = fotoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`; // Nombre de archivo único

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('fotos_personas') // Asegúrate de que el bucket se llama así
        .upload(fileName, fotoFile);

      if (uploadError) {
        console.error("[API] Error al subir la foto:", uploadError);
        throw new Error('No se pudo subir la imagen.');
      }

      // Obtenemos la URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from('fotos_personas')
        .getPublicUrl(fileName);

      fotoUrl = urlData.publicUrl;
      console.log(`[API] Foto subida con éxito. URL: ${fotoUrl}`);
    }
    // --- 1. VALIDACIÓN DE ID ÚNICO ---
    if (!numeroId) {
      throw new Error("El número de identificación es obligatorio.");
    }

    const { data: existingPerson, error: idError } = await supabaseAdmin
      .from('persona')
      .select('id', { count: 'exact' }) // Usamos count para ser más eficientes
      .eq('numero_id', numeroId);

    if (idError) {
      console.error("[API] Error al verificar ID:", idError);
      throw new Error(`Error de base de datos al verificar ID: ${idError.message}`);
    }

    if (existingPerson && existingPerson.length > 0) {
      console.log(`[API] El ID ${numeroId} ya existe. Rechazando.`);
      throw new Error('Ya existe una persona con este número de identificación.');
    }

    console.log(`[API] El ID ${numeroId} es único. Procediendo a insertar.`);

    // --- 2. CONSTRUCCIÓN DEL OBJETO ---
    const personaData = {
      tipo_id: formData.get('tipo_id')?.toString(),
      numero_id: numeroId,
      nombres: formData.get('nombres')?.toString(),
      primer_apellido: formData.get('primer_apellido')?.toString(),
      segundo_apellido: formData.get('segundo_apellido')?.toString() || null,
      genero: formData.get('genero')?.toString(),
      fecha_nacimiento: formData.get('fecha_nacimiento')?.toString(),
      edad: calcularEdad(formData.get('fecha_nacimiento')?.toString() || null),
      email: formData.get('email')?.toString(),
      direccion: formData.get('direccion')?.toString(),
      telefono: formData.get('telefono')?.toString(),

      url_foto: fotoUrl, // ¡Usamos la variable con la URL!
      user_id: user.id,
      sede_id: formData.get('sede_id')?.toString(),
    };
    console.log("[API] Objeto persona construido:", personaData);



    // --- 3. INSERCIÓN EN LA BASE DE DATOS ---
    const { data: insertedPerson, error: insertError } = await supabaseAdmin
      .from('persona')
      .insert(personaData)
      .select('id') // Pedimos que nos devuelva el registro insertado
      .single();

    if (insertError) {
      console.log("[API] Objeto persona construido:", personaData);
      throw new Error(`Error de base de datos al insertar: ${insertError.message}`);
    }
    if (!insertedPerson) {
      console.error("[API] La inserción no devolvió una persona, aunque no hubo error explícito.");
      throw new Error("No se pudo obtener el ID de la persona recién creada.");
    }

    console.log(`[API] Persona insertada con Exito. ID: ${insertedPerson.id}`);

// --- PASO 2: ASOCIAR LAS ESCALAS (usando nuestra nueva función) ---
    // ¡CORRECCIÓN DE FLUJO! Esto ahora se ejecuta ANTES de la redirección.
    await asociarEscalas(supabaseAdmin, insertedPerson.id, formData);
         
     // --- PASO 3: REDIRECCIÓN DE ÉXITO ---
     console.log("[API] ¡Éxito total! Redirigiendo...");
     return redirect('/personas?success=Persona+Creadas+con+Exito');
 

  } catch (e: any) {
    console.error("[API] Error en el bloque catch:", e.message);
    console.log("[API] Redirigiendo a /personas con mensaje de error.");
    return redirect(`/personas?error=${encodeURIComponent(e.message)}`);
  }


};


