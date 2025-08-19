import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// --- NUEVA GUARDA DE SEGURIDAD ---
// Verificamos si las variables de entorno se cargaron correctamente.
// Si no, lanzamos un error claro y detenemos la ejecución.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Las variables de entorno de Supabase (URL y Anon Key) no están definidas. Asegúrate de que tu archivo .env está bien configurado y que reiniciaste el servidor.");
}
// --- FIN DE LA GUARDA ---

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
