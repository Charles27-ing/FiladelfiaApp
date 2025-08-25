// src/scripts/personas-filters.js - VERSIÓN CORREGIDA PARA ASTRO

/**
 * Inicializa los filtros y la búsqueda de personas.
 * @param {Array<Object>} initialPersonas - El array inicial de personas a filtrar.
 */
export function initializePersonasFilters(initialPersonas) {
  console.log("Inicializando filtros con", initialPersonas.length, "personas.");

  const searchInput = document.getElementById("search-input");
  const sedeFilter = document.getElementById("sede-filter");
  const clearFiltersButton = document.getElementById("clear-filters");
  const personasTableBody = document.getElementById("personas-table-body");
  const personasCardsContainer = document.getElementById("personas-cards-container");
  const totalPersonasSpan = document.getElementById("total-personas");
  const personasFiltradas = document.getElementById("personas-filtradas");
  const sedesActivas = document.getElementById("sedes-activas");

  let currentPersonas = initialPersonas;

  // Actualizar conteos iniciales
  if (totalPersonasSpan) totalPersonasSpan.textContent = initialPersonas.length.toString();
  if (personasFiltradas) personasFiltradas.textContent = initialPersonas.length.toString();

  // Llenar el select de sedes
  populateSedeFilter(initialPersonas);

  /**
   * Llena el filtro de sedes con las opciones disponibles.
   * @param {Array<Object>} personas - Array de personas para extraer las sedes.
   */
  function populateSedeFilter(personas) {
    if (!sedeFilter) return;

    const sedes = [...new Set(personas
      .filter(p => p.sedes && p.sedes.nombre_sede)
      .map(p => ({ id: p.sedes.id, nombre: p.sedes.nombre_sede }))
      .map(s => JSON.stringify(s))
    )].map(s => JSON.parse(s));

    // Limpiar opciones existentes (excepto la primera)
    while (sedeFilter.children.length > 1) {
      sedeFilter.removeChild(sedeFilter.lastChild);
    }

    // Añadir opciones de sedes
    sedes.forEach(sede => {
      const option = document.createElement("option");
      option.value = sede.id;
      option.textContent = sede.nombre;
      sedeFilter.appendChild(option);
    });
  }

  /**
   * Renderiza las filas de la tabla de personas (vista desktop).
   * @param {Array<Object>} personasToRender - Array de personas a mostrar.
   */
  function renderPersonasTable(personasToRender) {
    if (!personasTableBody) return;

    personasTableBody.innerHTML = ""; // Limpiar tabla

    if (personasToRender.length === 0) {
      personasTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-gray-500">
            No se encontraron personas que coincidan con los filtros.
          </td>
        </tr>
      `;
      return;
    }

    personasToRender.forEach(persona => {
      const photoSrc = persona.url_foto || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
      const sedeName = persona.sedes ? persona.sedes.nombre_sede : "Sin Sede";
      const escalasHtml = persona.escalas && persona.escalas.length > 0
        ? persona.escalas.map(escala => `
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              ${escala.nombre_escala}
            </span>
          `).join("")
        : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Sin Escalas</span>`;

      const row = document.createElement("tr");
      row.className = "persona-row";
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex-shrink-0 h-10 w-10">
            <img class="h-10 w-10 rounded-full object-cover" src="${photoSrc}" alt="Foto de ${persona.nombres}">
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">
            ${persona.nombres} ${persona.primer_apellido} ${persona.segundo_apellido || ""}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-500">${persona.tipo_id}</div>
          <div class="text-sm text-gray-900">${persona.numero_id}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${persona.sedes ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
            ${sedeName}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex flex-wrap gap-1">${escalasHtml}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div class="text-sm text-gray-900">${persona.telefono || ""}</div>
          <div class="text-sm text-gray-500">${persona.email || ""}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button onclick="viewPerson('${persona.id}')" class="text-green-600 hover:text-green-900 mr-2" title="Ver Detalles">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button onclick="editPerson('${persona.id}')" class="text-blue-600 hover:text-blue-900 mr-2" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
            </svg>
          </button>
          <button onclick="deletePerson('${persona.id}', '${persona.nombres} ${persona.primer_apellido}')" class="text-red-600 hover:text-red-900" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm-2 4a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </td>
      `;
      personasTableBody.appendChild(row);
    });
  }

  /**
   * Renderiza las tarjetas de personas (vista móvil).
   * @param {Array<Object>} personasToRender - Array de personas a mostrar.
   */
  function renderPersonasCards(personasToRender) {
    if (!personasCardsContainer) return;

    personasCardsContainer.innerHTML = ""; // Limpiar contenedor

    if (personasToRender.length === 0) {
      personasCardsContainer.innerHTML = `
        <div class="col-span-full text-center py-10 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay personas</h3>
          <p class="mt-1 text-sm text-gray-500">Ajusta tus filtros o añade nuevas personas.</p>
        </div>
      `;
      return;
    }

    personasToRender.forEach(persona => {
      const photoSrc = persona.url_foto || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
      const sedeName = persona.sedes ? persona.sedes.nombre_sede : "Sin Sede";
      const escalasHtml = persona.escalas && persona.escalas.length > 0
        ? persona.escalas.map(escala => `
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              ${escala.nombre_escala}
            </span>
          `).join("")
        : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Sin Escalas</span>`;

      const card = document.createElement("div");
      card.className = "persona-card bg-white rounded-lg shadow-sm border border-gray-200 p-4";
      card.innerHTML = `
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <img class="h-12 w-12 rounded-full object-cover" src="${photoSrc}" alt="Foto de ${persona.nombres}">
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900 truncate">
                  ${persona.nombres} ${persona.primer_apellido} ${persona.segundo_apellido || ""}
                </h3>
                <p class="text-sm text-gray-500">${persona.numero_id} • ${persona.tipo_id}</p>
                <p class="text-sm text-gray-500">${persona.email || ""}</p>
              </div>
              <div class="flex items-center space-x-1">
                <button onclick="viewPerson('${persona.id}')" class="text-green-600 hover:text-green-900 p-1" title="Ver">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button onclick="editPerson('${persona.id}')" class="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button onclick="deletePerson('${persona.id}', '${persona.nombres} ${persona.primer_apellido}')" class="text-red-600 hover:text-red-900 p-1" title="Eliminar">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="mt-2">
              <p class="text-sm text-gray-600"><span class="font-medium">Sede:</span> ${sedeName}</p>
              <div class="mt-1 flex flex-wrap gap-1">${escalasHtml}</div>
              <p class="text-sm text-gray-600 mt-1"><span class="font-medium">Teléfono:</span> ${persona.telefono || "N/A"}</p>
            </div>
          </div>
        </div>
      `;
      personasCardsContainer.appendChild(card);
    });
  }

  /**
   * Aplica los filtros y actualiza la vista.
   */
  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedSede = sedeFilter ? sedeFilter.value : "";

    const filtered = initialPersonas.filter(persona => {
      const matchesSearch = (
        persona.nombres.toLowerCase().includes(searchTerm) ||
        persona.primer_apellido.toLowerCase().includes(searchTerm) ||
        (persona.segundo_apellido && persona.segundo_apellido.toLowerCase().includes(searchTerm)) ||
        persona.numero_id.includes(searchTerm)
      );

      const matchesSede = selectedSede === "" || (persona.sedes && persona.sedes.id === selectedSede);

      return matchesSearch && matchesSede;
    });

    renderPersonasTable(filtered);
    renderPersonasCards(filtered);

    // Actualizar contadores
    if (personasFiltradas) personasFiltradas.textContent = filtered.length.toString();
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", debounce(applyFilters, 300));
  }
  if (sedeFilter) {
    sedeFilter.addEventListener("change", applyFilters);
  }
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (sedeFilter) sedeFilter.value = "";
      applyFilters();
    });
  }

  // Inicializar la vista con todas las personas
  applyFilters();

  // Utilidad para debounce
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
}

