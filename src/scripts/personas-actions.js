// src/scripts/personas-actions.js - VERSIÓN ACTUALIZADA PARA NUEVOS CAMPOS

// Variable para almacenar el ID de la persona a eliminar
let personToDelete = null;

/**
 * Redirige a la página de detalles de una persona.
 * @param {string} personId - El ID de la persona.
 */
export function viewPerson(personId) {
  console.log("viewPerson llamada con ID:", personId);
  if (!personId) {
    console.error('ID de persona no válido');
    return;
  }
  window.location.href = `/personas/${personId}`;
}

/**
 * Redirige a la página de edición de una persona.
 * @param {string} personId - El ID de la persona.
 */
export function editPerson(personId) {
  console.log("editPerson llamada con ID:", personId);
  if (!personId) {
    console.error('ID de persona no válido');
    return;
  }
  window.location.href = `/personas/${personId}/editar`;
}

/**
 * Muestra el modal de confirmación para eliminar una persona.
 * @param {string} personId - El ID de la persona a eliminar.
 * @param {string} personName - El nombre completo de la persona a eliminar.
 */
export function deletePerson(personId, personName) {
  console.log("deletePerson llamada con ID:", personId, "Nombre:", personName);
  
  if (!personId || !personName) {
    console.error('Datos de persona no válidos');
    return;
  }
  
  personToDelete = personId;
  const deletePersonNameSpan = document.getElementById("delete-person-name");
  const deleteModal = document.getElementById("delete-modal");

  if (deletePersonNameSpan) {
    deletePersonNameSpan.textContent = personName;
  }
  if (deleteModal) {
    deleteModal.classList.remove("hidden");
  }
}

/**
 * Envía la solicitud de eliminación al servidor.
 */
export async function confirmDeletePerson() {
  console.log("Confirmando eliminación para ID:", personToDelete);

  if (!personToDelete) {
    console.error('No hay persona seleccionada para eliminar');
    return;
  }

  // Mostrar preloader
  window.showPreloader('eliminando');

  try {
    const response = await fetch(`/api/personas/${personToDelete}/delete`, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Éxito: mostrar checkmark
      window.showPreloaderSuccess(data.message);
      // Remover el elemento de la persona después de 1 segundo
      setTimeout(() => {
        // Buscar y remover la fila de la tabla o la tarjeta
        const personaElement = document.querySelector(`[data-persona-id="${personToDelete}"]`) ||
                              document.querySelector(`[onclick*="deletePerson('${personToDelete}'"]`);
        if (personaElement) {
          const row = personaElement.closest('tr') || personaElement.closest('.bg-white');
          if (row) {
            row.remove();
          }
        }
        closeDeleteModal();
      }, 1000);
    } else {
      // Error: mostrar mensaje
      window.hidePreloader();
      alert(data.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error:', error);
    window.hidePreloader();
    alert('Error de conexión. Inténtalo de nuevo.');
  }
}

/**
 * Cierra el modal de confirmación de eliminación.
 */
export function closeDeleteModal() {
  console.log("Cerrando modal de eliminación.");
  const deleteModal = document.getElementById("delete-modal");
  if (deleteModal) {
    deleteModal.classList.add("hidden");
  }
  personToDelete = null;
}

/**
 * Maneja la respuesta de la API (mensajes de éxito/error).
 */
export function handleApiResponse() {
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get("success");
  const errorMessage = urlParams.get("error");
  
  // Buscar contenedor de notificaciones existente o crear uno
  let notificationContainer = document.getElementById("notification-container");
  
  if (!notificationContainer) {
    // Si no existe, crear uno al inicio del contenido principal
    const mainContent = document.querySelector('main') || document.body;
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'mb-4';
    mainContent.insertBefore(notificationContainer, mainContent.firstChild);
  }

  if (notificationContainer) {
    notificationContainer.innerHTML = ""; // Limpiar notificaciones anteriores

    if (successMessage) {
      notificationContainer.innerHTML = `
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">¡Éxito!</strong>
          <span class="block sm:inline">${decodeURIComponent(successMessage)}</span>
          <span class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onclick="this.parentElement.style.display='none';">
            <svg class="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Cerrar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      `;
      // Limpiar el parámetro de la URL después de mostrar el mensaje
      history.replaceState({}, document.title, window.location.pathname);
    } else if (errorMessage) {
      notificationContainer.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">¡Error!</strong>
          <span class="block sm:inline">${decodeURIComponent(errorMessage)}</span>
          <span class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onclick="this.parentElement.style.display='none';">
            <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Cerrar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      `;
      history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

/**
 * Valida el formato de un número de identificación.
 * @param {string} numeroId - El número de identificación a validar.
 * @param {string} tipoId - El tipo de identificación.
 * @returns {boolean} - True si es válido, false si no.
 */
export function validateIdNumber(numeroId, tipoId) {
  if (!numeroId || !tipoId) return false;
  
  // Remover espacios y caracteres especiales
  const cleanId = numeroId.replace(/\s+/g, '').replace(/[^\d]/g, '');
  
  switch (tipoId) {
    case 'CC': // Cédula de Ciudadanía
      // Debe tener entre 6 y 10 dígitos
      return /^\d{6,10}$/.test(cleanId);
    
    case 'TI': // Tarjeta de Identidad
      // Debe tener entre 8 y 11 dígitos
      return /^\d{8,11}$/.test(cleanId);
    
    case 'CE': // Cédula de Extranjería
      // Debe tener entre 6 y 10 dígitos
      return /^\d{6,10}$/.test(cleanId);
    
    case 'RC': // Pasaporte
      // Puede tener letras y números, entre 6 y 12 caracteres
      return /^[A-Z0-9]{6,12}$/i.test(numeroId.replace(/\s+/g, ''));
    
    default:
      return false;
  }
}

/**
 * Muestra un mensaje de validación para el campo de ID.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} isError - Si es un mensaje de error o éxito.
 */
export function showIdValidationMessage(message, isError = true) {
  let messageContainer = document.getElementById('id-validation-message');
  
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'id-validation-message';
    messageContainer.className = 'mt-1 text-sm';
    
    // Buscar el campo de número de ID y agregar el mensaje después
    const numeroIdField = document.getElementById('numero_id');
    if (numeroIdField && numeroIdField.parentNode) {
      numeroIdField.parentNode.insertBefore(messageContainer, numeroIdField.nextSibling);
    }
  }
  
  messageContainer.className = `mt-1 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`;
  messageContainer.textContent = message;
  
  // Auto-ocultar después de 3 segundos
  setTimeout(() => {
    if (messageContainer) {
      messageContainer.textContent = '';
    }
  }, 3000);
}

/**
 * Inicializa los event listeners para las acciones de personas.
 */
export function initializePersonasActions() {
  console.log("Inicializando event listeners para acciones de personas...");
  
  // Event listeners para el modal de eliminación
  const confirmDelete = document.getElementById("confirm-delete");
  const cancelDelete = document.getElementById("cancel-delete");
  const deleteModal = document.getElementById("delete-modal");

  if (confirmDelete) {
    confirmDelete.addEventListener("click", confirmDeletePerson);
  }
  
  if (cancelDelete) {
    cancelDelete.addEventListener("click", closeDeleteModal);
  }
  
  if (deleteModal) {
    // Cerrar modal al hacer clic fuera de él
    deleteModal.addEventListener("click", function(e) {
      if (e.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }

  // Cerrar modal con tecla Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeDeleteModal();
    }
  });

  // Validación de ID en tiempo real (si estamos en un formulario)
  const numeroIdField = document.getElementById('numero_id');
  const tipoIdField = document.getElementById('tipo_id');
  
  if (numeroIdField && tipoIdField) {
    function validateIdInRealTime() {
      const numeroId = numeroIdField.value.trim();
      const tipoId = tipoIdField.value;
      
      if (numeroId && tipoId) {
        const isValid = validateIdNumber(numeroId, tipoId);
        
        if (isValid) {
          numeroIdField.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
          numeroIdField.classList.add('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
          showIdValidationMessage('✓ Número de identificación válido', false);
        } else {
          numeroIdField.classList.remove('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
          numeroIdField.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
          showIdValidationMessage('⚠ Formato de identificación inválido para el tipo seleccionado', true);
        }
      } else {
        // Resetear estilos si no hay datos
        numeroIdField.classList.remove(
          'border-red-300', 'focus:border-red-500', 'focus:ring-red-500',
          'border-green-300', 'focus:border-green-500', 'focus:ring-green-500'
        );
        const messageContainer = document.getElementById('id-validation-message');
        if (messageContainer) {
          messageContainer.textContent = '';
        }
      }
    }
    
    numeroIdField.addEventListener('input', validateIdInRealTime);
    tipoIdField.addEventListener('change', validateIdInRealTime);
  }

  // Manejar mensajes de la API al cargar la página
  handleApiResponse();
  
  console.log("Event listeners inicializados correctamente");
}

