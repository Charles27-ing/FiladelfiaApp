// public/scripts/personas-filters.js

/**
 * Inicializa los filtros y la búsqueda de personas.
 * @param {Array<Object>} initialPersonas - El array inicial de personas a filtrar.
 */
export function initializePersonasFilters (initialPersonas) {
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
      const escalasHtml = person.persona_escala && person.persona_escala.length > 0
        ? person.persona_escala.map(pe => pe.escala_de_crecimiento?.nombre_escala).filter(Boolean).map(name => `<span class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">${name}</span>`).join(" ")
        : `<span class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Sin Escala</span>`;

      // Estrella de bautismo
      const baptizedStar = person.bautizado ? `
        <svg class="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ` : '';

      const personRowHtml = `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <img class="h-10 w-10 rounded-full object-cover" src="${photoSrc}" alt="Foto de ${person.nombres}">
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">${person.nombres} ${person.primer_apellido} ${person.segundo_apellido || ""}</div>
                  ${baptizedStar}
                </div>
                <div class="text-sm text-gray-500">${person.email}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${person.tipo_id}: ${person.numero_id}</div>
            <div class="text-sm text-gray-500">${person.telefono}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${sedeName}</div>
            <div class="text-sm text-gray-500">${person.direccion || ''}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex flex-wrap gap-1">${escalasHtml}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onclick="viewPerson('${person.id}')" class="text-green-600 hover:text-green-900 mr-4">Ver</button>
            <button onclick="editPerson('${person.id}')" class="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
            <button onclick="deletePerson('${person.id}', '${person.nombres} ${person.primer_apellido}')" class="text-red-600 hover:text-red-900">Eliminar</button>
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
      const escalasHtml = person.persona_escala && person.persona_escala.length > 0
        ? person.persona_escala.map(pe => pe.escala_de_crecimiento?.nombre_escala).filter(Boolean).map(name => `<span class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">${name}</span>`).join(" ")
        : `<span class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Sin Escala</span>`;

      // Estrella de bautismo
      const baptizedStar = person.bautizado ? `
        <svg class="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ` : '';

      const personCardHtml = `
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden m-4">
          <div class="p-4">
            <div class="flex items-center space-x-4">
              <img class="h-16 w-16 rounded-full object-cover" src="${photoSrc}" alt="Foto de ${person.nombres}">
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
              <div class="flex flex-wrap gap-1">${escalasHtml}</div>
              <p class="text-sm text-gray-600"><span class="font-medium">Teléfono:</span> ${person.telefono}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Email:</span> ${person.email}</p>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button onclick="viewPerson('${person.id}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Ver
              </button>
              <button onclick="editPerson('${person.id}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Editar
              </button>
              <button onclick="deletePerson('${person.id}', '${person.nombres} ${person.primer_apellido}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
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
        (person.municipio && person.municipio.toLowerCase().includes(searchTerm))
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
};

