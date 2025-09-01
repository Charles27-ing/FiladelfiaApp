// src/scripts/personas/wizard-form.ts
export function initializePersonaWizard() {
  // --- Elementos del DOM ---
  const form = document.getElementById('wizard-form') as HTMLFormElement;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement; // Botón de Guardar
  const validationErrorDiv = document.getElementById('validation-error');
  const step1 = document.getElementById('step-1');
  const verifyInput = document.getElementById('numero_id') as HTMLInputElement;
  const verifyBtn = document.getElementById('verify-btn') as HTMLButtonElement;

  const step2 = document.getElementById('step-2');
  const step2MessageDiv = document.getElementById('step-2-message');
  const formNumeroIdInput = document.getElementById('form_numero_id') as HTMLInputElement;
  // ¡EL CAMBIO! Solo usamos el nuevo div de mensajes.
  const verificationMessageDiv = document.getElementById('id-error-message');

  // --- Comprobación de Seguridad ---
  if (!form || !submitBtn || !validationErrorDiv || !step1 || !verifyInput || !verifyBtn || !verificationMessageDiv || !step2 || !step2MessageDiv || !formNumeroIdInput) {
    console.error("Faltan elementos del DOM para el wizard. Revisa los IDs.");
    return;
  }

  // --- Lógica del Botón de Verificación ---
  verifyBtn.addEventListener('click', async () => {
    const numeroId = verifyInput.value;

    // Ocultamos y reseteamos el mensaje al empezar
    verificationMessageDiv.classList.add('hidden');
    verificationMessageDiv.classList.remove('bg-red-50', 'border-red-400', 'text-red-700');

    if (numeroId.length <= 4) {
      verificationMessageDiv.textContent = 'El número de ID debe tener más de 4 caracteres.';
      verificationMessageDiv.classList.add('bg-red-50', 'border-red-400', 'text-red-700');
      verificationMessageDiv.classList.remove('hidden');
      return;
    }

    verifyBtn.textContent = 'Verificando...';
    verifyBtn.disabled = true;

    try {
      const response = await fetch('/api/id-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroId }),
      });

      if (!response.ok) throw new Error('Error del servidor al verificar.');

      const { exists } = await response.json();

      if (exists) {
        verificationMessageDiv.textContent = 'Este número de ID ya está registrado. Por favor, introduce uno diferente.';
        verificationMessageDiv.classList.add('bg-red-50', 'border-red-400', 'text-red-700');
        verificationMessageDiv.classList.remove('hidden');
      } else {
        step2MessageDiv.textContent = `¡Perfecto! El número de ID "${numeroId}" es válido. Por favor, completa el resto de la información.`;
        formNumeroIdInput.value = numeroId;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
      }
    } catch (error) {
      verificationMessageDiv.textContent = 'No se pudo completar la verificación. Inténtalo de nuevo.';
      verificationMessageDiv.classList.add('bg-red-50', 'border-red-400', 'text-red-700');
      verificationMessageDiv.classList.remove('hidden');
      console.error(error);
    } finally {
      verifyBtn.textContent = 'Verificar y Continuar';
      verifyBtn.disabled = false;
    }
  });

  // ==================================================================
  // --- INICIO DE LA SECCIÓN AÑADIDA: LÓGICA DE ENVÍO DEL FORMULARIO ---
  // ==================================================================
  form.addEventListener('submit', (event) => {
    // Este log aparecerá en la consola del NAVEGADOR cuando hagas clic en "Guardar".
    console.log("--- [wizard-form.ts] Formulario final enviado, interceptando para validar... ---");
    // Ocultamos errores previos
    validationErrorDiv.classList.add('hidden');
    validationErrorDiv.textContent = '';
    
    // VALIDACIÓN: Asegurarnos de que el campo de nombres no está vacío.
    // Puedes añadir todas las validaciones que necesites aquí.
    const nombresInput = document.getElementById('nombres') as HTMLInputElement;
    if (nombresInput && nombresInput.value.trim() === '') {
      // Si la validación falla:
     // Mostramos el error en el div, no con un alert
     validationErrorDiv.textContent = 'El campo "Nombres" es obligatorio.';
     validationErrorDiv.classList.remove('hidden');

      // 1. Prevenimos que el formulario se envíe al servidor.
      event.preventDefault(); 
      
      // 2. Mostramos un log para saber qué pasó.
      console.error("VALIDACIÓN FALLIDA: El campo de nombres está vacío. Envío cancelado.");
      
      // 3. Detenemos la ejecución de esta función.
      return;
    }
// Si la validación es exitosa, desactivamos el botón para evitar doble clic
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    // Si todas las validaciones son exitosas, esta función simplemente termina.
    // NO llamamos a event.preventDefault(), permitiendo que el navegador
    // continúe con el envío normal del formulario a la URL especificada en el 'action' del <form>.
    console.log("VALIDACIÓN EXITOSA: Permitiendo el envío del formulario al servidor.");
  });
}
