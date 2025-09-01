// src/scripts/personas-filters.js - VERSIÓN FINAL CON MINISTERIOS

/**
 * Inicializa los filtros y la búsqueda de personas.
 * @param {Array<Object>} initialPersonas - El array inicial de personas a filtrar.
 */
export  function initializePersonasFilters(initialPersonas) {
  console.log("Inicializando filtros con", initialPersonas.length, "personas.");

  const searchInput = document.getElementById("search");
  const sedeFilter = document.getElementById("sede_filter");
  const clearFiltersButton = document.getElementById("clear_filters");
  const personasContainer = document.getElementById("personas-container");
  const personasContainerMobile = document.getElementById("personas-container-mobile");
  const totalCountSpan = document.getElementById("total-count");
  const filteredCountSpan = document.getElementById("filtered-count");

  let currentPersonas = initialPersonas;

  // Actualizar conteos iniciales
  if (totalCountSpan) totalCountSpan.textContent = initialPersonas.length.toString();
  if (filteredCountSpan) filteredCountSpan.textContent = initialPersonas.length.toString();

  // Llenar el filtro de sedes
  populateSedeFilter(initialPersonas);

  /**
   * Llena el select de sedes con las sedes únicas de las personas.
   * @param {Array<Object>} personas - Array de personas.
   */
  function populateSedeFilter(personas) {
    if (!sedeFilter) return;

    const sedesUnicas = [...new Set(personas.map(p => p.sedes).filter(Boolean))];
    sedesUnicas.forEach(sede => {
      const option = document.createElement("option");
      option.value = sede.id;
      option.textContent = sede.nombre_sede;
      sedeFilter.appendChild(option);
    });
  }

  /**
   * Renderiza las personas en el contenedor desktop (tabla).
   * @param {Array<Object>} personasToRender - Array de personas a mostrar.
   */
  function renderPersonasDesktop(personasToRender) {
    if (!personasContainer) return;

    personasContainer.innerHTML = ""; // Limpiar contenedor

    if (personasToRender.length === 0) {
      personasContainer.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-10 text-center text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay personas</h3>
            <p class="mt-1 text-sm text-gray-500">Ajusta tus filtros o añade nuevas personas.</p>
          </td>
        </tr>
      `;
      if (filteredCountSpan) filteredCountSpan.textContent = "0";
      return;
    }

    personasToRender.forEach(person => {
      const photoSrc = person.url_foto || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E`;
      const sedeName = person.sedes ? person.sedes.nombre_sede : "Sin Sede";
      
      // Escalas HTML
      const escalasHtml = person.escalas && person.escalas.length > 0
        ? person.escalas.map(escala => `<span class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">${escala.nombre_escala}</span>`).join(" ")
        : `<span class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Sin Escala</span>`;

      // Ministerios HTML
      const ministeriosHtml = person.ministerios && person.ministerios.length > 0
        ? person.ministerios.map(ministerio => `<span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">${ministerio.nombre_minist}</span>`).join(" ")
        : `<span class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Sin Ministerio</span>`;

      // ⭐ ESTRELLA DE BAUTISMO - IMPLEMENTACIÓN CORRECTA
      const baptizedStar = person.bautizado === true ? `
        <svg class="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" title="Persona bautizada">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ` : '';

      // Información de ubicación
      const ubicacionTexto = [person.departamento, person.municipio].filter(Boolean).join(' - ');

      const personRowHtml = `
        <tr class="hover:bg-gray-50 transition-colors duration-150">
          <!-- INFORMACIÓN PERSONAL CON FOTO AL LADO -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-12 w-12">
                <img class="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm" src="${photoSrc}" alt="Foto de ${person.nombres}" loading="lazy">
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">${person.nombres} ${person.primer_apellido} ${person.segundo_apellido || ""}</div>
                  ${baptizedStar}
                </div>
                <div class="text-sm text-gray-500">${person.email}</div>
                <div class="text-sm text-gray-500">${person.telefono}</div>
              </div>
            </div>
          </td>
          
          <!-- IDENTIFICACIÓN -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${person.tipo_id}: ${person.numero_id}</div>
            <div class="text-sm text-gray-500">${person.genero || 'No especificado'}</div>
            ${person.estado_civil ? `<div class="text-xs text-gray-400">${person.estado_civil}</div>` : ''}
          </td>
          
          <!-- UBICACIÓN -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${sedeName}</div>
            ${ubicacionTexto ? `<div class="text-sm text-gray-500">${ubicacionTexto}</div>` : ''}
            ${person.direccion ? `<div class="text-xs text-gray-400">${person.direccion}</div>` : ''}
          </td>
          
          <!-- MINISTERIOS Y ESCALAS -->
          <td class="px-6 py-4">
            <div class="space-y-2">
              <div>
                <div class="text-xs text-gray-500 mb-1">Ministerios:</div>
                <div class="flex flex-wrap gap-1">${ministeriosHtml}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-1">Escalas:</div>
                <div class="flex flex-wrap gap-1">${escalasHtml}</div>
              </div>
            </div>
          </td>
          
          <!-- ACCIONES -->
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex justify-end space-x-2">
              <button onclick="viewPerson('${person.id}')" class="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors" title="Ver detalles">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              <button onclick="editPerson('${person.id}')" class="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors" title="Editar">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button onclick="deletePerson('${person.id}', '${person.nombres} ${person.primer_apellido}')" class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors" title="Eliminar">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
      personasContainer.insertAdjacentHTML("beforeend", personRowHtml);
    });

    if (filteredCountSpan) filteredCountSpan.textContent = personasToRender.length.toString();
  }

  /**
   * Renderiza las personas en el contenedor móvil (cards).
   * @param {Array<Object>} personasToRender - Array de personas a mostrar.
   */
  function renderPersonasMobile(personasToRender) {
    if (!personasContainerMobile) return;

    personasContainerMobile.innerHTML = ""; // Limpiar contenedor

    if (personasToRender.length === 0) {
      personasContainerMobile.innerHTML = `
        <div class="text-center py-10 text-gray-500 m-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay personas</h3>
          <p class="mt-1 text-sm text-gray-500">Ajusta tus filtros o añade nuevas personas.</p>
        </div>
      `;
      return;
    }

    personasToRender.forEach(person => {
      const photoSrc = person.url_foto || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E`;
      const sedeName = person.sedes ? person.sedes.nombre_sede : "Sin Sede";
      
      // Escalas HTML
      const escalasHtml = person.escalas && person.escalas.length > 0
        ? person.escalas.map(escala => `<span class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">${escala.nombre_escala}</span>`).join(" ")
        : `<span class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Sin Escala</span>`;

      // Ministerios HTML
      const ministeriosHtml = person.ministerios && person.ministerios.length > 0
        ? person.ministerios.map(ministerio => `<span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">${ministerio.nombre_minist}</span>`).join(" ")
        : `<span class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Sin Ministerio</span>`;

      // ⭐ ESTRELLA DE BAUTISMO - IMPLEMENTACIÓN CORRECTA
      const baptizedStar = person.bautizado === true ? `
        <svg class="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" title="Persona bautizada">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ` : '';

      // Información de ubicación
      const ubicacionTexto = [person.departamento, person.municipio].filter(Boolean).join(' - ');

      const personCardHtml = `
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden m-4 hover:shadow-md transition-shadow duration-200">
          <div class="p-4">
            <div class="flex items-center space-x-4">
              <img class="h-16 w-16 rounded-full object-cover border-2 border-gray-200 shadow-sm" src="${photoSrc}" alt="Foto de ${person.nombres}" loading="lazy">
              <div class="flex-1">
                <div class="flex items-center">
                  <h3 class="text-lg font-semibold text-gray-900">${person.nombres} ${person.primer_apellido}</h3>
                  ${baptizedStar}
                </div>
                <p class="text-sm text-gray-500">${person.tipo_id}: ${person.numero_id}</p>
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <p class="text-sm text-gray-600"><span class="font-medium">Sede:</span> ${sedeName}</p>
              ${ubicacionTexto ? `<p class="text-sm text-gray-600"><span class="font-medium">Ubicación:</span> ${ubicacionTexto}</p>` : ''}
              <div>
                <p class="text-xs text-gray-500 mb-1">Ministerios:</p>
                <div class="flex flex-wrap gap-1">${ministeriosHtml}</div>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Escalas:</p>
                <div class="flex flex-wrap gap-1">${escalasHtml}</div>
              </div>
              <p class="text-sm text-gray-600"><span class="font-medium">Teléfono:</span> ${person.telefono}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Email:</span> ${person.email}</p>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button onclick="viewPerson('${person.id}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                Ver
              </button>
              <button onclick="editPerson('${person.id}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Editar
              </button>
              <button onclick="deletePerson('${person.id}', '${person.nombres} ${person.primer_apellido}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
      personasContainerMobile.insertAdjacentHTML("beforeend", personCardHtml);
    });
  }

  /**
   * Aplica los filtros y actualiza la vista.
   */
  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedSede = sedeFilter ? sedeFilter.value : "";

    const filtered = initialPersonas.filter(person => {
      const matchesSearch = (
        person.nombres.toLowerCase().includes(searchTerm) ||
        person.primer_apellido.toLowerCase().includes(searchTerm) ||
        (person.segundo_apellido && person.segundo_apellido.toLowerCase().includes(searchTerm)) ||
        person.numero_id.includes(searchTerm) ||
        person.email.toLowerCase().includes(searchTerm) ||
        (person.departamento && person.departamento.toLowerCase().includes(searchTerm)) ||
        (person.municipio && person.municipio.toLowerCase().includes(searchTerm)) ||
        (person.direccion && person.direccion.toLowerCase().includes(searchTerm)) ||
        (person.telefono && person.telefono.includes(searchTerm))
      );

      const matchesSede = selectedSede === "" || (person.sedes && person.sedes.id === selectedSede);

      return matchesSearch && matchesSede;
    });

    renderPersonasDesktop(filtered);
    renderPersonasMobile(filtered);
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
  renderPersonasDesktop(initialPersonas);
  renderPersonasMobile(initialPersonas);

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

  console.log("Filtros inicializados correctamente");
}

