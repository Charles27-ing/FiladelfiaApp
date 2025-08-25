// src/scripts/personas-actions.js
// Funciones para las acciones CRUD de personas

/**
 * Variables globales para el manejo de eliminación
 */
let personToDelete = null;

/**
 * Inicializar los event listeners para las acciones
 */
// Funciones globales
window.viewPerson = function(personId) { /* ... */ };
window.editPerson = function(personId) { /* ... */ };
window.deletePerson = function(personId, personName) { /* ... */ };

// Función de inicialización
window.initializePersonasActions = function() {
  console.log("Inicializando acciones de personas...");
    setupDeleteModal();
}

/**
 * Configurar el modal de eliminación
 */
function setupDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    const confirmDelete = document.getElementById('confirm-delete');
    const cancelDelete = document.getElementById('cancel-delete');

    if (confirmDelete) {
        confirmDelete.addEventListener('click', confirmDeletePerson);
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', closeDeleteModal);
    }
    
    // Cerrar modal al hacer clic en el overlay
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDeleteModal();
        }
    });
}

/**
 * Ver detalles de una persona
 * @param {string} personId - ID de la persona
 */
window.viewPerson = function(personId) {
    // Redirigir a la página de detalles
    window.location.href = `/personas/${personId}`;
};

/**
 * Editar una persona
 * @param {string} personId - ID de la persona
 */
window.editPerson = function(personId) {
    // Redirigir a la página de edición
    window.location.href = `/personas/${personId}/editar`;
};

/**
 * Mostrar modal de confirmación para eliminar persona
 * @param {string} personId - ID de la persona
 * @param {string} personName - Nombre de la persona
 */
window.deletePerson = function(personId, personName) {
    personToDelete = personId;
    const deletePersonNameElement = document.getElementById('delete-person-name');
    const deleteModal = document.getElementById('delete-modal');
    
    if (deletePersonNameElement) {
        deletePersonNameElement.textContent = personName;
    }
    
    if (deleteModal) {
        deleteModal.classList.remove('hidden');
        // Enfocar el botón de cancelar para mejor accesibilidad
        const cancelButton = document.getElementById('cancel-delete');
        if (cancelButton) {
            setTimeout(() => cancelButton.focus(), 100);
        }
    }
};

/**
 * Confirmar y ejecutar la eliminación de la persona
 */
function confirmDeletePerson() {
    if (!personToDelete) {
        console.error('No hay persona seleccionada para eliminar');
        return;
    }

    // Mostrar estado de carga en el botón
    const confirmButton = document.getElementById('confirm-delete');
    if (confirmButton) {
        const originalText = confirmButton.textContent;
        confirmButton.textContent = 'Eliminando...';
        confirmButton.disabled = true;
    }

    // Crear formulario para enviar la eliminación
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/personas/${personToDelete}/delete`;
    form.style.display = 'none';
    
    // Añadir campo oculto para identificar el método
    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';
    form.appendChild(methodInput);
    
    // Añadir al DOM y enviar
    document.body.appendChild(form);
    form.submit();
}

/**
 * Cerrar el modal de eliminación
 */
function closeDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    const confirmButton = document.getElementById('confirm-delete');
    
    if (deleteModal) {
        deleteModal.classList.add('hidden');
    }
    
    // Restaurar el botón de confirmación
    if (confirmButton) {
        confirmButton.textContent = 'Eliminar';
        confirmButton.disabled = false;
    }
    
    // Limpiar la variable
    personToDelete = null;
}

/**
 * Mostrar notificación de éxito o error
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success' o 'error')
 */
export function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    
    const icon = type === 'success' 
        ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
        : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>';
    
    notification.innerHTML = `
        <div class="p-4 ${bgColor} border">
            <div class="flex">
                <svg class="h-5 w-5 ${iconColor}" viewBox="0 0 20 20" fill="currentColor">
                    ${icon}
                </svg>
                <div class="ml-3">
                    <p class="text-sm font-medium ${textColor}">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button class="inline-flex ${textColor} hover:${textColor.replace('800', '600')} focus:outline-none" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Manejar respuestas de la API y mostrar notificaciones apropiadas
 */
export function handleApiResponse() {
    // Verificar parámetros de URL para mensajes de éxito/error
    const urlParams = new URLSearchParams(window.location.search);
    const successMessage = urlParams.get('success');
    const errorMessage = urlParams.get('error');
    
    if (successMessage) {
        showNotification(decodeURIComponent(successMessage), 'success');
        // Limpiar la URL sin recargar la página
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    if (errorMessage) {
        showNotification(decodeURIComponent(errorMessage), 'error');
        // Limpiar la URL sin recargar la página
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

