// src/scripts/personas-actions.js - VERSIÓN CORREGIDA PARA ASTRO

// Variable para almacenar el ID de la persona a eliminar
let personToDelete = null;

/**
 * Redirige a la página de detalles de una persona.
 * @param {string} personId - El ID de la persona.
 */
export function viewPerson(personId) {
  console.log("viewPerson llamada con ID:", personId);
  window.location.href = `/personas/${personId}`;
}

/**
 * Redirige a la página de edición de una persona.
 * @param {string} personId - El ID de la persona.
 */
export function editPerson(personId) {
  console.log("editPerson llamada con ID:", personId);
  window.location.href = `/personas/${personId}/editar`;
}

/**
 * Muestra el modal de confirmación para eliminar una persona.
 * @param {string} personId - El ID de la persona a eliminar.
 * @param {string} personName - El nombre completo de la persona a eliminar.
 */
export function deletePerson(personId, personName) {
  console.log("deletePerson llamada con ID:", personId, "Nombre:", personName);
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
function confirmDeletePerson() {
  console.log("Confirmando eliminación para ID:", personToDelete);
  if (personToDelete) {
    // Usar fetch para llamar al endpoint de eliminación
    fetch(`/api/personas/${personToDelete}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (response.ok) {
        // Redirigir con mensaje de éxito
        window.location.href = '/personas?success=' + encodeURIComponent('Persona eliminada correctamente');
      } else {
        // Redirigir con mensaje de error
        window.location.href = '/personas?error=' + encodeURIComponent('Error al eliminar la persona<');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      window.location.href = '/personas?error=' + encodeURIComponent('Error de conexión al eliminar la persona');
    });
  }
}

/**
 * Cierra el modal de confirmación de eliminación.
 */
function closeDeleteModal() {
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
  const notificationContainer = document.getElementById("notification-container");

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
 * Inicializa los event listeners para las acciones de personas (modal de eliminación).
 */
export function initializePersonasActions() {
  console.log("Inicializando event listeners para acciones de personas...");
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

  // Manejar mensajes de la API al cargar la página
  handleApiResponse();
}

