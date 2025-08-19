// src/scripts/personas/modal-form.ts

export function initializePersonaForm() {
  // --- 1. OBTENER ELEMENTOS DEL DOM ---
  const form = document.getElementById('personaForm') as HTMLFormElement;
  const modal = document.getElementById('personaModal');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const fotoUploadInput = document.getElementById('foto_upload') as HTMLInputElement;
  const fotoPreview = document.getElementById('foto_preview') as HTMLImageElement;
  const numeroIdInput = document.getElementById('numero_id') as HTMLInputElement;
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

  if (!form || !modal || !openModalBtn || !closeModalBtn || !cancelBtn || !fotoUploadInput || !fotoPreview || !numeroIdInput || !submitButton) {
    console.error("Faltan elementos del DOM para el modal de personas.");
    return;
  }

  // --- 2. ESTADO DEL FORMULARIO ---
  let isIdValid = true; // Bandera para el guardia de seguridad
  let debounceTimer: ReturnType<typeof setTimeout>;

  // --- 3. LÓGICA DE UI (APERTURA/CIERRE/PREVIEW) ---
  const openModal = () => modal.style.display = 'flex';
  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
    fotoPreview.src = 'https://via.placeholder.com/150';
    numeroIdInput.classList.remove('border-red-500' );
    const errorDiv = document.getElementById('id-error-message');
    if (errorDiv) errorDiv.textContent = '';
    isIdValid = true;
    submitButton.disabled = false;
  };

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  fotoUploadInput.addEventListener('change', () => {
    const file = fotoUploadInput.files?.[0];
    if (file) {
      fotoPreview.src = URL.createObjectURL(file);
    }
  });

  // --- 4. LÓGICA DE VALIDACIÓN DE ID EN TIEMPO REAL ---
  // ¡AHORA ESTÁ EN EL NIVEL CORRECTO!
  numeroIdInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const numeroId = numeroIdInput.value;
    const errorDiv = document.getElementById('id-error-message');

    isIdValid = true;
    if (errorDiv) errorDiv.textContent = '';
    numeroIdInput.classList.remove('border-red-500');
    submitButton.disabled = false;

    debounceTimer = setTimeout(async () => {
      if (numeroId.length > 4) {
        try {
          const response = await fetch('/api/verify-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numeroId }),
          });
          if (!response.ok) return;
          const { exists } = await response.json();
          
          if (exists) {
            isIdValid = false;
            if (errorDiv) errorDiv.textContent = 'Este número de ID ya está registrado.';
            numeroIdInput.classList.add('border-red-500');
          }
        } catch (error) {
          console.error("Error al verificar ID:", error);
          isIdValid = false;
        }
      }
    }, 500);
  });

  // --- 5. LÓGICA DE ENVÍO DEL FORMULARIO (UN SOLO LISTENER) ---
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // ¡CRUCIAL! Prevenimos el envío para controlarlo con fetch.

  // ¡EL GUARDIA DE SEGURIDAD!
  if (!isIdValid) {
    alert('No se puede guardar: el número de identificación ya está en uso.');
    return; // Detenemos todo si la validación en tiempo real ya falló.
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Guardando...';

  try {
    const formData = new FormData(form);
    
    // Hacemos la petición a nuestra API
    const response = await fetch('/api/personas', {
      method: 'POST',
      body: formData,
    });

    // --- ¡LA LÓGICA DE RESPUESTA CLAVE! ---
    if (response.ok) {
      // Si la respuesta es exitosa (status 200-299), la API ya nos ha redirigido.
      // Pero por si acaso, podemos forzar una recarga para ver los cambios.
      // No necesitamos un alert aquí, porque la página mostrará el mensaje de éxito.
      window.location.href = response.url; // Usamos la URL de redirección de la API
    } else {
      // Si la respuesta es un error (status 4xx-5xx), leemos el mensaje de error.
      const errorData = await response.json();
      // Lanzamos un error para que lo capture el bloque catch.
      throw new Error(errorData.message || 'Ocurrió un error desconocido.');
    }
    // --- FIN DE LA LÓGICA DE RESPUESTA ---

  } catch (error: any) {
    // El bloque catch ahora mostrará el error real que viene de la API.
    alert('Error: ' + error.message);
  } finally {
    // Esto se ejecuta siempre, tanto si hay éxito como si hay error.
    submitButton.disabled = false;
    submitButton.textContent = 'Guardar Persona';
  }
});
  
}
