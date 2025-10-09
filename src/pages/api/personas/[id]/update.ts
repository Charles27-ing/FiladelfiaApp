// src/pages/api/personas/[id]/update.ts - VERSIÓN OPTIMIZADA CON BUCKET CORRECTO
import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";
import { toTitleCaseEs } from "@/utils/titleCaseEs";

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const isAjax = request.headers.get('X-Requested-With') === 'XMLHttpRequest';

  try {
    const { id } = params;

    if (!id) {
      console.error("ID de persona no proporcionado");
      const errorMsg = "ID de persona no válido";
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/personas?error=${encodeURIComponent(errorMsg)}`);
    }

    console.log(`[UPDATE] Iniciando actualización de persona con ID: ${id}`);

    // Obtener datos del formulario
    const formData = await request.formData();
    
    // ✅ EXTRAER TODOS LOS CAMPOS (SIN EDAD)
    const nombres = toTitleCaseEs(formData.get("nombres")?.toString().trim() || "");
    const primer_apellido = toTitleCaseEs(formData.get("primer_apellido")?.toString().trim() || "");
    const segundo_apellidoRaw = formData.get("segundo_apellido")?.toString().trim() || null;
    const segundo_apellido = segundo_apellidoRaw ? toTitleCaseEs(segundo_apellidoRaw) : null;
    const numero_id = formData.get("numero_id")?.toString().trim();
    const tipo_id = formData.get("tipo_id")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const telefono = formData.get("telefono")?.toString().trim();
    const direccion = formData.get("direccion")?.toString().trim() || null;
    const genero = formData.get("genero")?.toString().trim() || null;
    const fecha_nacimiento = formData.get("fecha_nacimiento")?.toString().trim() || null;
    const estado_civil = formData.get("estado_civil")?.toString().trim() || null;
    const departamento = formData.get("departamento")?.toString().trim() || null;
    const municipio = formData.get("municipio")?.toString().trim() || null;
    const sede_id = formData.get("sede_id")?.toString().trim() || null;
    const bautizado = formData.get("bautizado") === "true";

    // ✅ VALIDACIONES BÁSICAS
    if (!nombres || !primer_apellido || !numero_id || !tipo_id || !email || !telefono) {
      console.error("Campos obligatorios faltantes");
      const errorMsg = "Todos los campos obligatorios deben ser completados";
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Email inválido:", email);
      const errorMsg = "El email no tiene un formato válido";
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
    }

    // Validar teléfono (solo números, 7-10 dígitos)
    const telefonoRegex = /^[0-9]{7,10}$/;
    if (!telefonoRegex.test(telefono)) {
      console.error("Teléfono inválido:", telefono);
      const errorMsg = "El teléfono debe contener solo números (7-10 dígitos)";
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
      }
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
    }

    console.log("[UPDATE] Datos básicos validados correctamente");

    // ✅ MANEJO OPTIMIZADO DE FOTO DE PERFIL
    let url_foto = formData.get("url_foto")?.toString().trim() || null;
    const fotoArchivo = formData.get("foto") as File;

    if (fotoArchivo && fotoArchivo.size > 0) {
      console.log("[UPDATE] Procesando subida de archivo de foto...");
      
      // Validar tamaño (máx 5MB)
      if (fotoArchivo.size > 5 * 1024 * 1024) {
        console.error("Archivo de foto demasiado grande:", fotoArchivo.size);
        const errorMsg = "La imagen no puede superar los 5MB";
        if (isAjax) {
          return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
        }
        return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(fotoArchivo.type)) {
        console.error("Tipo de archivo no permitido:", fotoArchivo.type);
        const errorMsg = "Solo se permiten archivos JPG, PNG o WebP";
        if (isAjax) {
          return new Response(JSON.stringify({ error: errorMsg }), { status: 400 });
        }
        return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
      }

      try {
        // ✅ VERIFICAR SI EL BUCKET EXISTE, SI NO, CREARLO
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error al listar buckets:", bucketsError);
          const errorMsg = "Error de configuración de almacenamiento";
          if (isAjax) {
            return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
          }
          return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
        }

        const bucketName = "fotos_personas";
       

        // Obtener la foto actual para eliminarla después
        const { data: personaActual } = await supabase
          .from("persona")
          .select("url_foto")
          .eq("id", id)
          .single();

        // Generar nombre único para el archivo
        const fileExtension = fotoArchivo.name.split('.').pop();
        const fileName = `persona_${id}_${Date.now()}.${fileExtension}`;

        console.log("[UPDATE] Subiendo archivo:", fileName);

        // ✅ SUBIR ARCHIVO AL BUCKET CORRECTO
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fotoArchivo, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
           console.error("Error al subir archivo:", uploadError);
           const errorMsg = "Error al subir la imagen: " + uploadError.message;
           if (isAjax) {
             return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
           }
           return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
         }

        // ✅ OBTENER URL PÚBLICA
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        url_foto = publicUrlData.publicUrl;
        console.log("[UPDATE] Foto subida exitosamente:", url_foto);

        // ✅ ELIMINAR FOTO ANTERIOR SI EXISTE
        if (personaActual?.url_foto) {
          try {
            // Extraer nombre del archivo de la URL
            const urlParts = personaActual.url_foto.split('/');
            const oldFileName = urlParts[urlParts.length - 1];
            
            if (oldFileName && oldFileName.startsWith('persona_')) {
              const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([oldFileName]);
              
              if (deleteError) {
                console.warn("[UPDATE] No se pudo eliminar la foto anterior:", deleteError);
              } else {
                console.log("[UPDATE] Foto anterior eliminada:", oldFileName);
              }
            }
          } catch (deleteError) {
            console.warn("[UPDATE] Error al eliminar foto anterior:", deleteError);
          }
        }

      } catch (storageError) {
        console.error("Error en el manejo de storage:", storageError);
        return redirect(`/personas/${id}/editar?error=${encodeURIComponent("Error al procesar la imagen")}`);
      }
    }

    // ✅ ACTUALIZAR DATOS PRINCIPALES DE LA PERSONA (SIN EDAD)
    const updateData = {
      nombres,
      primer_apellido,
      segundo_apellido,
      numero_id,
      tipo_id,
      email,
      telefono,
      direccion,
      genero,
      fecha_nacimiento,
      estado_civil,
      departamento,
      municipio,
      sede_id,
      bautizado,
      ...(url_foto && { url_foto }) // Solo incluir si hay URL
    };

    console.log("[UPDATE] Datos a actualizar:", updateData);

    const { error: updateError } = await supabase
      .from("persona")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error al actualizar persona:", updateError);
      const errorMsg = "Error al actualizar los datos: " + updateError.message;
      if (isAjax) {
        return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
      }
      return redirect(`/personas/${id}/editar?error=${encodeURIComponent(errorMsg)}`);
    }

    console.log("[UPDATE] Datos principales actualizados correctamente");

    // ✅ ACTUALIZAR ESCALAS DE CRECIMIENTO
    const escalasSeleccionadas = formData.getAll("escalas").map(e => e.toString());
    console.log("[UPDATE] Escalas seleccionadas:", escalasSeleccionadas);

    // Eliminar escalas existentes
    const { error: deleteEscalasError } = await supabase
      .from("persona_escala")
      .delete()
      .eq("persona_id", id);

    if (deleteEscalasError) {
      console.error("Error al eliminar escalas existentes:", deleteEscalasError);
    } else {
      console.log("[UPDATE] Escalas existentes eliminadas");
    }

    // Insertar nuevas escalas
    if (escalasSeleccionadas.length > 0) {
      const escalasToInsert = escalasSeleccionadas.map(escalaId => ({
        persona_id: id,
        escala_id: escalaId
      }));

      const { error: insertEscalasError } = await supabase
        .from("persona_escala")
        .insert(escalasToInsert);

      if (insertEscalasError) {
        console.error("Error al insertar nuevas escalas:", insertEscalasError);
      } else {
        console.log("[UPDATE] Nuevas escalas insertadas:", escalasToInsert.length);
      }
    }

    // ✅ ACTUALIZAR MINISTERIOS
    const ministeriosSeleccionados = formData.getAll("ministerios").map(m => m.toString());
    console.log("[UPDATE] Ministerios seleccionados:", ministeriosSeleccionados);

    // Eliminar ministerios existentes
    const { error: deleteMinisteriosError } = await supabase
      .from("persona_ministerios")
      .delete()
      .eq("id_persona", id);

    if (deleteMinisteriosError) {
      console.error("Error al eliminar ministerios existentes:", deleteMinisteriosError);
    } else {
      console.log("[UPDATE] Ministerios existentes eliminados");
    }

    // Insertar nuevos ministerios
    if (ministeriosSeleccionados.length > 0) {
      const ministeriosToInsert = ministeriosSeleccionados.map(ministerioId => ({
        id_persona: id,
        id_ministerio: ministerioId
      }));

      const { error: insertMinisteriosError } = await supabase
        .from("persona_ministerios")
        .insert(ministeriosToInsert);

      if (insertMinisteriosError) {
        console.error("Error al insertar nuevos ministerios:", insertMinisteriosError);
      } else {
        console.log("[UPDATE] Nuevos ministerios insertados:", ministeriosToInsert.length);
      }
    }

    console.log("[UPDATE] Actualización completada exitosamente");

    const successMsg = "¡Persona actualizada con éxito!";
    if (isAjax) {
      return new Response(JSON.stringify({ success: true, message: successMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Redirigir con mensaje de éxito
    return redirect(`/personas/${id}?success=${encodeURIComponent(successMsg)}`);

  } catch (error) {
    console.error("Error general en actualización:", error);
    return redirect(`/personas/${params.id}/editar?error=${encodeURIComponent("Error al actualizar la persona. Por favor, inténtalo de nuevo.")}`);
  }
};
