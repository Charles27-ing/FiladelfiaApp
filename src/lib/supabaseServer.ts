import { createServerClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY no están definidos.');
}

// Adaptador de cookies para Astro (API routes y componentes SSR)
export function getSupabaseServer(cookies: {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string, options?: any) => void;
  delete: (name: string, options?: any) => void;
}) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        cookies.set(name, value, options);
      },
      remove(name: string, options?: any) {
        cookies.delete(name, options);
      },
    },
  });
}
