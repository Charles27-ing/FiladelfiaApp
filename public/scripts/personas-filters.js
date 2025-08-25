// src/scripts/personas-filters.js
// Funciones para filtros, búsqueda y estadísticas de personas

/**
 * Variables globales para el manejo de filtros
 */
let allPersonas = [];
let filteredPersonas = [];

/**
 * Inicializar el sistema de filtros
 * @param {Array} personas - Array de personas desde el servidor
 */
export function initializePersonasFilters(personas) {
    allPersonas = personas;
    filteredPersonas = personas;
    
    initializeFilters();
    setupEventListeners();
    updateStats();
}

/**
 * Configurar los filtros iniciales
 */
function initializeFilters() {
    // Llenar el select de sedes
    const sedeFilter = document.getElementById('sede-filter');
    if (!sedeFilter) return;
    
    const sedes = [...new Set(allPersonas.map(p => p.sedes?.codigo).filter(Boolean))];
    
    // Limpiar opciones existentes (excepto la primera)
    while (sedeFilter.children.length > 1) {
        sedeFilter.removeChild(sedeFilter.lastChild);
    }
    
    // Añadir opciones de sedes
    sedes.forEach(sede => {
        const option = document.createElement('option');
        option.value = sede;
        option.textContent = sede;
        sedeFilter.appendChild(option);
    });
}

/**
 * Configurar event listeners para los filtros
 */
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const sedeFilter = document.getElementById('sede-filter');
    const clearFilters = document.getElementById('clear-filters');

    // Búsqueda en tiempo real con debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterPersonas, 300));
    }
    
    // Filtro por sede
    if (sedeFilter) {
        sedeFilter.addEventListener('change', filterPersonas);
    }
    
    // Botón de limpiar filtros
    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
    }
}

/**
 * Filtrar personas según los criterios de búsqueda
 */
function filterPersonas() {
    const searchInput = document.getElementById('search-input');
    const sedeFilter = document.getElementById('sede-filter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const sedeFilterValue = sedeFilter ? sedeFilter.value : '';

    filteredPersonas = allPersonas.filter(persona => {
        // Búsqueda por texto (nombre, apellido, identificación)
        const searchText = `${persona.nombres} ${persona.primer_apellido} ${persona.segundo_apellido} ${persona.numero_id}`.toLowerCase();
        const matchesSearch = !searchTerm || searchText.includes(searchTerm);
        
        // Filtro por sede
        const matchesSede = !sedeFilterValue || persona.sedes?.codigo === sedeFilterValue;
        
        return matchesSearch && matchesSede;
    });

    updateDisplay();
    updateStats();
}

/**
 * Actualizar la visualización de personas filtradas
 */
function updateDisplay() {
    updateTableDisplay();
    updateCardsDisplay();
    updateNoResultsMessage();
}

/**
 * Actualizar la tabla de personas (desktop)
 */
function updateTableDisplay() {
    const tableRows = document.querySelectorAll('.persona-row');
    let visibleCount = 0;

    tableRows.forEach(row => {
        // Extraer el ID de la persona del botón de ver
        const viewButton = row.querySelector('button[onclick*="viewPerson"]');
        if (!viewButton) return;
        
        const onclickAttr = viewButton.getAttribute('onclick');
        const personIdMatch = onclickAttr.match(/'([^']+)'/);
        if (!personIdMatch) return;
        
        const personId = personIdMatch[1];
        const isVisible = filteredPersonas.some(p => p.id === personId);
        
        if (isVisible) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    return visibleCount;
}

/**
 * Actualizar las tarjetas de personas (móvil)
 */
function updateCardsDisplay() {
    const cards = document.querySelectorAll('.persona-card');

    cards.forEach(card => {
        // Extraer el ID de la persona del botón de ver
        const viewButton = card.querySelector('button[onclick*="viewPerson"]');
        if (!viewButton) return;
        
        const onclickAttr = viewButton.getAttribute('onclick');
        const personIdMatch = onclickAttr.match(/'([^']+)'/);
        if (!personIdMatch) return;
        
        const personId = personIdMatch[1];
        const isVisible = filteredPersonas.some(p => p.id === personId);
        
        if (isVisible) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Mostrar/ocultar mensaje de "no hay resultados"
 */
function updateNoResultsMessage() {
    const noResults = document.getElementById('no-results');
    if (!noResults) return;
    
    if (filteredPersonas.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

/**
 * Actualizar las estadísticas mostradas
 */
function updateStats() {
    const totalPersonasElement = document.getElementById('total-personas');
    const personasFiltradas = document.getElementById('personas-filtradas');
    const sedesActivasElement = document.getElementById('sedes-activas');
    
    if (totalPersonasElement) {
        totalPersonasElement.textContent = allPersonas.length;
    }
    
    if (personasFiltradas) {
        personasFiltradas.textContent = filteredPersonas.length;
    }
    
    if (sedesActivasElement) {
        const sedesActivas = [...new Set(filteredPersonas.map(p => p.sedes?.nombre_sede).filter(Boolean))].length;
        sedesActivasElement.textContent = sedesActivas;
    }
}

/**
 * Limpiar todos los filtros aplicados
 */
function clearAllFilters() {
    const searchInput = document.getElementById('search-input');
    const sedeFilter = document.getElementById('sede-filter');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (sedeFilter) {
        sedeFilter.value = '';
    }
    
    // Resetear a todas las personas
    filteredPersonas = allPersonas;
    updateDisplay();
    updateStats();
    
    // Enfocar el campo de búsqueda para mejor UX
    if (searchInput) {
        searchInput.focus();
    }
}

/**
 * Buscar personas por texto específico
 * @param {string} searchText - Texto a buscar
 */
export function searchPersonas(searchText) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = searchText;
        filterPersonas();
    }
}

/**
 * Filtrar por sede específica
 * @param {string} sedeCode - Código de la sede
 */
export function filterBySede(sedeCode) {
    const sedeFilter = document.getElementById('sede-filter');
    if (sedeFilter) {
        sedeFilter.value = sedeCode;
        filterPersonas();
    }
}

/**
 * Obtener estadísticas actuales
 * @returns {Object} Objeto con las estadísticas
 */
export function getCurrentStats() {
    return {
        total: allPersonas.length,
        filtered: filteredPersonas.length,
        sedesActivas: [...new Set(filteredPersonas.map(p => p.sedes?.nombre_sede).filter(Boolean))].length,
        escalasUnicas: [...new Set(filteredPersonas.flatMap(p => p.escalas?.map(e => e.nombre_escala) || []))].length
    };
}

/**
 * Exportar personas filtradas (para futuras funcionalidades)
 * @returns {Array} Array de personas filtradas
 */
export function getFilteredPersonas() {
    return filteredPersonas;
}

/**
 * Utilidad para debounce (evitar demasiadas llamadas seguidas)
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} Función con debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Resaltar texto en los resultados de búsqueda
 * @param {string} text - Texto original
 * @param {string} searchTerm - Término a resaltar
 * @returns {string} Texto con resaltado HTML
 */
export function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

/**
 * Obtener sugerencias de búsqueda
 * @param {string} partialText - Texto parcial
 * @returns {Array} Array de sugerencias
 */
export function getSearchSuggestions(partialText) {
    if (!partialText || partialText.length < 2) return [];
    
    const suggestions = new Set();
    const searchTerm = partialText.toLowerCase();
    
    allPersonas.forEach(persona => {
        // Sugerencias de nombres
        if (persona.nombres.toLowerCase().includes(searchTerm)) {
            suggestions.add(persona.nombres);
        }
        
        // Sugerencias de apellidos
        if (persona.primer_apellido.toLowerCase().includes(searchTerm)) {
            suggestions.add(persona.primer_apellido);
        }
        
        if (persona.segundo_apellido && persona.segundo_apellido.toLowerCase().includes(searchTerm)) {
            suggestions.add(persona.segundo_apellido);
        }
        
        // Sugerencias de identificación
        if (persona.numero_id.includes(searchTerm)) {
            suggestions.add(persona.numero_id);
        }
    });
    
    return Array.from(suggestions).slice(0, 5); // Máximo 5 sugerencias
}

