import type { APIRoute } from 'astro';
import type { Categoria } from '@models/categoria.model';
import { supabase } from '@lib/supabase';

// GET all categories or a single category by ID
export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  
  try {
    if (slug) {
      // Get single category
      const categoriaId = slug;
      const { data: categoria, error } = await supabase.from('categorias').select('*').eq('id', categoriaId).single();
      
      if (error || !categoria) {
        return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { status: 404 });
      }
      return new Response(JSON.stringify(categoria), { status: 200 });
    } else {
      // Get all categories
      const { data: categorias, error } = await supabase.from('categorias').select('*');
      if (error) throw error;
      return new Response(JSON.stringify(categorias), { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};

// POST a new category
export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const nombre = formData.get('nombre') as string;
  const tipo = formData.get('tipo') as 'ingreso' | 'egreso';
  const descripcion = formData.get('descripcion') as string | null;

  if (!nombre || !tipo) {
    return new Response(JSON.stringify({ error: 'Nombre y tipo son campos requeridos' }), { status: 400 });
  }

  try {
    const { data: newCategoria, error } = await supabase.from('categorias').insert({
      nombre,
      tipo,
      descripcion
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify(newCategoria), { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({ error: 'Error al crear la categoría' }), { status: 500 });
  }
};

// PUT (update) a category
async function updateCategory(id: string, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const tipo = formData.get('tipo') as 'ingreso' | 'egreso';
  const descripcion = formData.get('descripcion') as string | null;

  if (!nombre || !tipo) {
    return new Response(JSON.stringify({ error: 'Nombre y tipo son campos requeridos' }), { status: 400 });
  }

  try {
    const { data: updatedCategoria, error } = await supabase.from('categorias').update({
      nombre,
      tipo,
      descripcion,
      updated_at: new Date()
    }).eq('id', id).select().single();

    if (error) throw error;

    if (!updatedCategoria) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Categoría actualizada con éxito', categoria: updatedCategoria }), { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la categoría' }), { status: 500 });
  }
}

// DELETE a category
export const DELETE: APIRoute = async ({ params }) => {
  const { slug } = params;
  const categoriaId = slug;

  if (!categoriaId) {
    return new Response(JSON.stringify({ error: 'ID de categoría es requerido' }), { status: 400 });
  }

  try {
    const { error, count } = await supabase.from('categorias').delete({ count: 'exact' }).eq('id', categoriaId);

    if (error) throw error;

    if (count === 0) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada o ya fue eliminada' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Categoría eliminada con éxito' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar la categoría' }), { status: 500 });
  }
};

// Handle PUT via POST with _method override
export const ALL: APIRoute = async (context) => {
  const { request, params } = context;
  
  // For DELETE requests, just call the DELETE handler
  if (request.method === 'DELETE') {
      return DELETE(context);
  }

  const formData = await request.clone().formData();
  const method = formData.get('_method') as string | null;

  if (request.method === 'POST' && method === 'PUT') {
    const { slug } = params;
    if (!slug) return new Response(JSON.stringify({ error: 'ID no proporcionado' }), { status: 400 });
    return updateCategory(slug, formData);
  }

  // Fallback for other methods if needed, or return a 405 Method Not Allowed
  return new Response('Método no permitido', { status: 405 });
};
