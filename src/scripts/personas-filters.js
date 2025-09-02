// src/scripts/personas-filters.js - VERSIÓN CORREGIDA SIN DUPLICADOS EN FILTRO DE SEDES

/**
 * Inicializa los filtros y la búsqueda de personas.
 * @param {Array<Object>} initialPersonas - El array inicial de personas a filtrar.
 */
export function initializePersonasFilters(initialPersonas) {
  console.log("Inicializando filtros con", initialPersonas.length, "personas.");

  const searchInput = document.getElementById("search");
  const sedeFilter = document.getElementById("sede_filter");
  const clearFiltersButton = document.getElementById("clear_filters");
  const personasContainer = document.getElementById("personas-container");
  const personasContainerMobile = document.getElementById("personas-container-mobile");
  const totalCountSpan = document.getElementById("total-count");
  const filteredCountSpan = document.getElementById("filtered-count");

  // Elementos de paginación
  const prevBtnMobile = document.getElementById("prev-btn-mobile");
  const nextBtnMobile = document.getElementById("next-btn-mobile");
  const prevBtnDesktop = document.getElementById("prev-btn-desktop");
  const nextBtnDesktop = document.getElementById("next-btn-desktop");
  const paginationFrom = document.getElementById("pagination-from");
  const paginationTo = document.getElementById("pagination-to");
  const paginationTotal = document.getElementById("pagination-total");

  let currentPersonas = initialPersonas;
  let currentPage = 1;
  const itemsPerPage = 5; // Número de elementos por página

  // Actualizar conteos iniciales
  if (totalCountSpan) totalCountSpan.textContent = initialPersonas.length.toString();
  if (filteredCountSpan) filteredCountSpan.textContent = initialPersonas.length.toString();

  // ✅ LLENAR EL FILTRO DE SEDES SIN DUPLICADOS
  populateSedeFilter(initialPersonas);

  /**
   * ✅ FUNCIÓN CORREGIDA: Llena el select de sedes con las sedes únicas de las personas.
   * @param {Array<Object>} personas - Array de personas.
   */
  function populateSedeFilter(personas) {
    if (!sedeFilter) return;

    console.log("Poblando filtro de sedes...");

    // ✅ USAR MAP PARA ELIMINAR DUPLICADOS POR ID
    const sedesMap = new Map();
    
    personas.forEach(persona => {
      if (persona.sedes && persona.sedes.id) {
        sedesMap.set(persona.sedes.id, persona.sedes);
      }
    });

    // Convertir a array y ordenar alfabéticamente
    const sedesUnicas = Array.from(sedesMap.values())
      .sort((a, b) => a.nombre_sede.localeCompare(b.nombre_sede));

    console.log("Sedes únicas encontradas:", sedesUnicas.length);

    // ✅ LIMPIAR OPCIONES EXISTENTES (EXCEPTO LA PRIMERA "Todas las sedes")
    while (sedeFilter.children.length > 1) {
      sedeFilter.removeChild(sedeFilter.lastChild);
    }

    // Agregar opciones únicas
    sedesUnicas.forEach(sede => {
      const option = document.createElement("option");
      option.value = sede.id; // ✅ USAR ID COMO VALUE
      option.textContent = sede.nombre_sede;
      sedeFilter.appendChild(option);
    });

    console.log("Filtro de sedes poblado con", sedesUnicas.length, "opciones");
  }

  /**
   * Renderiza las personas en el contenedor desktop (tabla) con paginación.
   * @param {Array<Object>} personasToRender - Array de personas a mostrar.
   */
  function renderPersonasDesktop(personasToRender) {
    if (!personasContainer) return;

    // Calcular índices para la paginación
    const totalPages = Math.ceil(personasToRender.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, personasToRender.length);
    const paginatedPersonas = personasToRender.slice(startIndex, endIndex);

    // Actualizar controles de paginación
    updatePaginationControls(personasToRender.length);

    personasContainer.innerHTML = ""; // Limpiar contenedor

    if (paginatedPersonas.length === 0) {
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

    paginatedPersonas.forEach(person => {
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

      // ⭐ ESTRELLA DE BAUTISMO
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
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

    if (filteredCountSpan) filteredCountSpan.textContent = paginatedPersonas.length.toString();
  }

  /**
   * Renderiza las personas en el contenedor móvil (cards) con paginación.
   * @param {Array<Object>} personasToRender - Array de personas a mostrar.
   */
  function renderPersonasMobile(personasToRender) {
    if (!personasContainerMobile) return;

    // Calcular índices para la paginación
    const totalPages = Math.ceil(personasToRender.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, personasToRender.length);
    const paginatedPersonas = personasToRender.slice(startIndex, endIndex);

    // Actualizar controles de paginación
    updatePaginationControls(personasToRender.length);

    personasContainerMobile.innerHTML = ""; // Limpiar contenedor

    if (paginatedPersonas.length === 0) {
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

    paginatedPersonas.forEach(person => {
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

      // ⭐ ESTRELLA DE BAUTISMO
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
   * Actualiza los controles de paginación.
   * @param {number} totalItems - Número total de elementos filtrados.
   */
  function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

    // Actualizar textos
    if (paginationFrom) paginationFrom.textContent = startIndex;
    if (paginationTo) paginationTo.textContent = endIndex;
    if (paginationTotal) paginationTotal.textContent = totalItems;

    // Actualizar estado de los botones
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage >= totalPages;

    [prevBtnMobile, prevBtnDesktop].forEach(btn => {
      if (btn) {
        btn.disabled = isFirstPage;
        btn.classList.toggle('opacity-50', isFirstPage);
        btn.classList.toggle('cursor-not-allowed', isFirstPage);
        btn.classList.toggle('hover:bg-gray-50', !isFirstPage);
      }
    });

    [nextBtnMobile, nextBtnDesktop].forEach(btn => {
      if (btn) {
        btn.disabled = isLastPage;
        btn.classList.toggle('opacity-50', isLastPage);
        btn.classList.toggle('cursor-not-allowed', isLastPage);
        btn.classList.toggle('hover:bg-gray-50', !isLastPage);
      }
    });
  }

  /**
   * Cambia a la página especificada.
   * @param {number} pageNumber - Número de página a la que cambiar.
   */
  function goToPage(pageNumber) {
    const totalPages = Math.ceil(currentPersonas.length / itemsPerPage);
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    
    if (newPage !== currentPage) {
      currentPage = newPage;
      renderPersonasDesktop(currentPersonas);
      renderPersonasMobile(currentPersonas);
      
      // Desplazarse al principio de la tabla
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  /**
   * ✅ FUNCIÓN CORREGIDA: Aplica los filtros y actualiza la vista.
   */
  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedSede = sedeFilter ? sedeFilter.value : "";

    console.log("Aplicando filtros - Búsqueda:", searchTerm, "Sede:", selectedSede);

    const filtered = initialPersonas.filter(person => {
      const matchesSearch = (
        person.nombres.toLowerCase().includes(searchTerm) ||
        person.primer_apellido.toLowerCase().includes(searchTerm) ||
        (person.segundo_apellido && person.segundo_apellido.toLowerCase().includes(searchTerm)) ||
        person.numero_id.includes(searchTerm) ||
        person.email.toLowerCase().includes(searchTerm) ||
        person.telefono.includes(searchTerm) ||
        (person.departamento && person.departamento.toLowerCase().includes(searchTerm)) ||
        (person.municipio && person.municipio.toLowerCase().includes(searchTerm))
      );

      // ✅ CORREGIDO: COMPARAR POR ID EN LUGAR DE NOMBRE
      const matchesSede = !selectedSede || (person.sedes && person.sedes.id === selectedSede);

      return matchesSearch && matchesSede;
    });

    console.log("Personas filtradas:", filtered.length);

    currentPersonas = filtered;
    currentPage = 1; // Resetear a la primera página al filtrar
    renderPersonasDesktop(filtered);
    renderPersonasMobile(filtered);
  }

  // ✅ EVENT LISTENERS
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      currentPage = 1; // Resetear a la primera página al buscar
      applyFilters();
    });
  }

  if (sedeFilter) {
    sedeFilter.addEventListener("change", function() {
      currentPage = 1; // Resetear a la primera página al filtrar
      applyFilters();
    });
  }

  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", function() {
      if (searchInput) searchInput.value = "";
      if (sedeFilter) sedeFilter.value = "";
      currentPage = 1; // Resetear a la primera página al limpiar filtros
      applyFilters();
    });
  }

  // Event listeners para los botones de paginación
  [prevBtnMobile, prevBtnDesktop].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => goToPage(currentPage - 1));
    }
  });

  [nextBtnMobile, nextBtnDesktop].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => goToPage(currentPage + 1));
    }
  });

  // ✅ RENDERIZADO INICIAL
  applyFilters();

  console.log("Filtros inicializados correctamente");
}
