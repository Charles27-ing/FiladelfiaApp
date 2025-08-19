// src/scripts/layouts/main-layout.ts
import { supabase } from '../../lib/supabase';

export function initializeLayout() {
  const logoutButton = document.getElementById('logout-btn');

  if (logoutButton) {
    logoutButton.addEventListener('click', async (event) => {
      event.preventDefault();
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert('Error al cerrar sesión: ' + error.message);
      } else {
        window.location.href = '/';
      }
    });
  }
}
