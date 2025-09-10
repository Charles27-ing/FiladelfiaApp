// src/scripts/transacciones-filters.ts

interface Transaccion {
    id: string;
    fecha: string;
    monto: number;
    tipo: 'ingreso' | 'egreso';
    categoria_id: string;
    categoria_nombre: string;
    actividad_id?: string;
    actividad_nombre?: string;
    persona_id?: string;
    persona_nombre?: string;
    descripcion?: string;
    evidencia?: string;
  }
  
  interface Actividad {
    id: string;
    nombre: string;
  }
  
  /**
   * Inicializa los filtros y la paginación para el listado de transacciones.
   * @param initialTransacciones - Array inicial de transacciones.
   * @param initialActividades - Array inicial de actividades.
   */
  export function initializeTransaccionesFilters(initialTransacciones: Transaccion[], initialActividades: Actividad[]) {
    console.log('Inicializando filtros con', initialTransacciones.length, 'transacciones y', initialActividades.length, 'actividades');
  
    // Elementos del DOM
    const actividadFilter = document.getElementById('actividad_filter') as HTMLSelectElement;
    const fechaInicioFilter = document.getElementById('fecha_inicio') as HTMLInputElement;
    const fechaFinFilter = document.getElementById('fecha_fin') as HTMLInputElement;
    const searchButton = document.getElementById('search_btn') as HTMLButtonElement;
    const clearFiltersButton = document.getElementById('clear_filters') as HTMLButtonElement;
    const transaccionesContainer = document.getElementById('transacciones-container') as HTMLElement;
    const transaccionesContainerMobile = document.getElementById('transacciones-container-mobile') as HTMLElement;
    const resumenContainer = document.getElementById('resumen-container') as HTMLElement;
    const resumenIngresos = document.getElementById('resumen-ingresos') as HTMLElement;
    const resumenEgresos = document.getElementById('resumen-egresos') as HTMLElement;
    const resumenNeto = document.getElementById('resumen-neto') as HTMLElement;
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    const paginationFrom = document.getElementById('pagination-from') as HTMLElement;
    const paginationTo = document.getElementById('pagination-to') as HTMLElement;
    const paginationTotal = document.getElementById('pagination-total') as HTMLElement;
  
    // Validar elementos del DOM
    if (!transaccionesContainer || !transaccionesContainerMobile) {
      console.error('Error: Contenedores de transacciones no encontrados');
      return;
    }
  
    let currentTransacciones = initialTransacciones;
    let currentPage = 1;
    const itemsPerPage = 15;
  
    // Formatear moneda
    function formatCurrency(amount: number): string {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
    }
  
    // Renderizar transacciones
    function renderTransacciones() {
      console.log('Renderizando transacciones:', currentTransacciones.length);
      const totalPages = Math.ceil(currentTransacciones.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, currentTransacciones.length);
      const paginatedTransacciones = currentTransacciones.slice(startIndex, endIndex);
  
      // Actualizar paginación
      paginationFrom.textContent = startIndex + 1 + '';
      paginationTo.textContent = endIndex + '';
      paginationTotal.textContent = currentTransacciones.length + '';
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage >= totalPages;
  
      // Tabla Desktop
      transaccionesContainer.innerHTML = paginatedTransacciones.length > 0
        ? paginatedTransacciones.map(t => `
            <tr>
              <td class="px-6 py-4">${new Date(t.fecha).toLocaleDateString('es-CO')}</td>
              <td class="px-6 py-4">${formatCurrency(t.monto)}</td>
              <td class="px-6 py-4">${t.tipo}</td>
              <td class="px-6 py-4">${t.categoria_nombre || 'Sin categoría'}</td>
              <td class="px-6 py-4">${t.actividad_nombre || 'N/A'}</td>
              <td class="px-6 py-4">${t.persona_nombre || 'N/A'}</td>
              <td class="px-6 py-4">${t.descripcion || ''}</td>
            </tr>
          `).join('')
        : `<tr><td colspan="7" class="px-6 py-4 text-center">No hay transacciones para mostrar</td></tr>`;
  
      // Tarjetas Móvil
      transaccionesContainerMobile.innerHTML = paginatedTransacciones.length > 0
        ? paginatedTransacciones.map(t => `
            <div class="border rounded-lg p-4 bg-white">
              <p><strong>Fecha:</strong> ${new Date(t.fecha).toLocaleDateString('es-CO')}</p>
              <p><strong>Monto:</strong> ${formatCurrency(t.monto)}</p>
              <p><strong>Tipo:</strong> ${t.tipo}</p>
              <p><strong>Categoría:</strong> ${t.categoria_nombre || 'Sin categoría'}</p>
              <p><strong>Actividad:</strong> ${t.actividad_nombre || 'N/A'}</p>
              <p><strong>Persona:</strong> ${t.persona_nombre || 'N/A'}</p>
              <p><strong>Descripción:</strong> ${t.descripcion || ''}</p>
            </div>
          `).join('')
        : `<div class="p-4 text-center">No hay transacciones para mostrar</div>`;
  
      // Actualizar resumen si hay filtro de actividad
      if (actividadFilter.value) {
        updateResumen(actividadFilter.value);
      } else {
        resumenContainer.classList.add('hidden');
      }
    }
  
    // Actualizar resumen
    async function updateResumen(actividadId: string) {
      try {
        const response = await fetch(`/api/contabilidad/actividades/${actividadId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        resumenIngresos.textContent = formatCurrency(data.resumen?.ingresos || 0);
        resumenEgresos.textContent = formatCurrency(data.resumen?.egresos || 0);
        resumenNeto.textContent = formatCurrency(data.resumen?.neto || 0);
        resumenContainer.classList.remove('hidden');
      } catch (err) {
        console.error('Error cargando resumen:', err);
        resumenContainer.classList.add('hidden');
      }
    }
  
    // Aplicar filtros
    function applyFilters() {
      const fechaInicio = fechaInicioFilter.value;
      const fechaFin = fechaFinFilter.value;
      const actividadId = actividadFilter.value;
  
      console.log('Aplicando filtros:', { fechaInicio, fechaFin, actividadId });
  
      currentTransacciones = initialTransacciones.filter(t => {
        const fechaTransaccion = new Date(t.fecha);
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : null;
  
        const matchesFecha =
          (!fechaInicioDate || fechaInicioDate <= fechaTransaccion) &&
          (!fechaFinDate || fechaTransaccion <= new Date(fechaFinDate.setHours(23, 59, 59, 999)));
        const matchesActividad = !actividadId || t.actividad_id === actividadId;
        return matchesFecha && matchesActividad;
      });
  
      currentPage = 1;
      renderTransacciones();
    }
  
    // Inicializar eventos
    actividadFilter.addEventListener('change', applyFilters);
    searchButton.addEventListener('click', applyFilters);
    clearFiltersButton.addEventListener('click', () => {
      fechaInicioFilter.value = '';
      fechaFinFilter.value = '';
      actividadFilter.value = '';
      applyFilters();
    });
  
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTransacciones();
      }
    });
  
    nextBtn.addEventListener('click', () => {
      if (currentPage < Math.ceil(currentTransacciones.length / itemsPerPage)) {
        currentPage++;
        renderTransacciones();
      }
    });
  
    // Render inicial
    renderTransacciones();
  }