// src/scripts/transacciones-filters.ts
// Importar librerías para exportación
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Módulo de filtros de transacciones

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
  numero_transaccion?: string;
  estado?: string;
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
  const exportExcelButton = document.getElementById('export-excel-all') as HTMLButtonElement | null;
  const exportPdfButton = document.getElementById('export-pdf-all') as HTMLButtonElement | null;

  // Validar elementos del DOM
  if (!transaccionesContainer || !transaccionesContainerMobile) {
    console.error('Error: Contenedores de transacciones no encontrados');
    return;
  }

  let currentTransacciones = initialTransacciones;
  let currentPage = 1;
  const itemsPerPage = 15;

  // La función formatCurrency ahora se importa del módulo export-utils

  // Renderizar transacciones
  function renderTransacciones() {
    console.log('Renderizando transacciones:', currentTransacciones.length);
    const totalPages = Math.ceil(currentTransacciones.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, currentTransacciones.length);
    const paginatedTransacciones = currentTransacciones.slice(startIndex, endIndex);

    // Actualizar paginación
    paginationFrom.textContent = currentTransacciones.length > 0 ? (startIndex + 1) + '' : '0';
    paginationTo.textContent = endIndex + '';
    paginationTotal.textContent = currentTransacciones.length + '';
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Tabla Desktop
    transaccionesContainer.innerHTML = paginatedTransacciones.length > 0
      ? paginatedTransacciones.map(t => `
            <tr>
              <td class="px-6 py-4">${t.numero_transaccion || 'N/A'}</td>
              <td class="px-6 py-4">${new Date(t.fecha).toLocaleDateString('es-CO')}</td>
              <td class="px-6 py-4">${formatCurrency(t.monto)}</td>
              <td class="px-6 py-4">${t.tipo}</td>
              <td class="px-6 py-4">${t.categoria_nombre || 'Sin categoría'}</td>
              <td class="px-6 py-4">${t.actividad_nombre || 'N/A'}</td>
              <td class="px-6 py-4">${t.persona_nombre || 'N/A'}</td>
              <td class="px-6 py-4">${t.descripcion || ''}</td>
              <td class="px-6 py-4">${t.estado || 'Activa'}</td>
              
              <td class="px-6 py-4 text-right">
                <div class="flex items-center space-x-2">
                  <a href="/contabilidad/transacciones/${t.id}" class="text-blue-600 hover:text-blue-800 transition-colors" title="Ver detalles">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </a>
                ${t.estado !== 'anulada' ? `
                    <button class="anular-btn text-red-600 hover:text-red-800 transition-colors" data-id="${t.id}" data-numero="${t.numero_transaccion}" title="Anular transacción">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                  </button>
                  ` : `
                    <span class="text-gray-400" title="Transacción anulada">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                  `}
                </div>
             </td>
            </tr>
          `).join('')
      : `<tr><td colspan="8" class="px-6 py-4 text-center">No hay transacciones para mostrar</td></tr>`;

    // Tarjetas Móvil
    transaccionesContainerMobile.innerHTML = paginatedTransacciones.length > 0
      ? paginatedTransacciones.map(t => `
            <div class="border rounded-lg p-4 bg-white">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p><strong>N° Transacción:</strong> ${t.numero_transaccion || 'N/A'}</p>
              <p><strong>Fecha:</strong> ${new Date(t.fecha).toLocaleDateString('es-CO')}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <a href="/contabilidad/transacciones/${t.id}" class="text-blue-600 hover:text-blue-800 transition-colors" title="Ver detalles">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </a>
                  ${t.estado !== 'anulada' ? `
                    <button class="anular-btn text-red-600 hover:text-red-800 transition-colors" data-id="${t.id}" data-numero="${t.numero_transaccion}" title="Anular transacción">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  ` : `
                    <span class="text-gray-400" title="Transacción anulada">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                  `}
                </div>
              </div>
              <p><strong>Monto:</strong> ${formatCurrency(t.monto)}</p>
              <p><strong>Tipo:</strong> ${t.tipo}</p>
              <p><strong>Categoría:</strong> ${t.categoria_nombre || 'Sin categoría'}</p>
              <p><strong>Actividad:</strong> ${t.actividad_nombre || 'N/A'}</p>
              <p><strong>Persona:</strong> ${t.persona_nombre || 'N/A'}</p>
              <p><strong>Descripción:</strong> ${t.descripcion || ''}</p>
              <p><strong>Estado:</strong> ${t.estado || 'Activa'}</p>
            </div>
          `).join('')
      : `<div class="p-4 text-center">No hay transacciones para mostrar</div>`;

    // Actualizar resumen si hay filtro de actividad
    if (actividadFilter.value) {
      updateResumenLocal();
    } else {
      resumenContainer.classList.add('hidden');
    }
  }

  // Actualizar resumen local (excluyendo transacciones anuladas)
  function updateResumenLocal() {
    try {
      const transaccionesFiltradas = currentTransacciones.filter(t => t.actividad_id === actividadFilter.value);
      const resumen = calculateResumen(transaccionesFiltradas);
      
      resumenIngresos.textContent = formatCurrency(resumen.ingresos);
      resumenEgresos.textContent = formatCurrency(resumen.egresos);
      resumenNeto.textContent = formatCurrency(resumen.neto);
      resumenContainer.classList.remove('hidden');
    } catch (err) {
      console.error('Error calculando resumen:', err);
      resumenContainer.classList.add('hidden');
    }
  }

  // Actualizar resumen (método anterior - mantener por compatibilidad)
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
  // Mostrar mensaje de éxito
  function showSuccessMessage(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        ${message}
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Crear modal de anulación
  function createAnulacionModal(id: string, numero: string): void {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.id = 'anulacion-overlay';
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0';
    modal.innerHTML = `
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Anular Transacción</h3>
            <p class="text-sm text-gray-600">Transacción #${numero}</p>
          </div>
        </div>
        
        <!-- Mensaje de confirmación -->
        <div class="mb-6">
          <p class="text-gray-700 mb-4">¿Está seguro que desea anular esta transacción?</p>
          <p class="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
        </div>
        
        <!-- Campo de motivo -->
        <div class="mb-6">
          <label for="motivo-anulacion" class="block text-sm font-medium text-gray-700 mb-2">
            Motivo de anulación *
          </label>
          <textarea 
            id="motivo-anulacion" 
            rows="3" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            placeholder="Ingrese el motivo de la anulación..."
            required
          ></textarea>
        </div>
        
        <!-- Botones -->
        <div class="flex space-x-3">
          <button 
            id="cancelar-anulacion" 
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            id="confirmar-anulacion" 
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anular Transacción
          </button>
        </div>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animar entrada
    setTimeout(() => {
      modal.classList.remove('scale-95', 'opacity-0');
      modal.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    // Event listeners
    const motivoTextarea = modal.querySelector('#motivo-anulacion') as HTMLTextAreaElement;
    const cancelarBtn = modal.querySelector('#cancelar-anulacion') as HTMLButtonElement;
    const confirmarBtn = modal.querySelector('#confirmar-anulacion') as HTMLButtonElement;
    
    // Validar motivo en tiempo real
    motivoTextarea.addEventListener('input', () => {
      const motivo = motivoTextarea.value.trim();
      confirmarBtn.disabled = motivo.length < 5;
    });
    
    // Cancelar
    const cancelar = () => {
      modal.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    
    cancelarBtn.addEventListener('click', cancelar);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cancelar();
    });
    
    // Confirmar
    confirmarBtn.addEventListener('click', () => {
      const motivo = motivoTextarea.value.trim();
      if (motivo.length >= 5) {
        cancelar();
        anularTransaccion(id, numero, motivo);
      }
    });
    
    // Enfocar textarea
    setTimeout(() => motivoTextarea.focus(), 100);
  }

  // Manejar eventos de anulación tanto en tabla como en tarjetas móviles
  function handleAnularClick(e: Event) {
    const target = e.target as HTMLElement;
    const anularBtn = target.closest('.anular-btn') as HTMLButtonElement;
    
    if (anularBtn) {
      const id = anularBtn.dataset.id;
      const numero = anularBtn.dataset.numero;
      
      if (id && numero) {
        createAnulacionModal(id, numero);
      }
    }
  }

  async function anularTransaccion(id: string, numero: string, notas: string) {
    try {
      // Mostrar indicador de carga
      const anularBtn = document.querySelector(`[data-id="${id}"]`) as HTMLButtonElement;
      if (anularBtn) {
        anularBtn.disabled = true;
        anularBtn.innerHTML = `
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      }

          const response = await fetch(`/api/contabilidad/transacciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `notas_anulacion=${encodeURIComponent(notas)}`,
          });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al anular la transacción');
      }
      
      // Mostrar mensaje de éxito
      showSuccessMessage('Transacción anulada exitosamente');
      setTimeout(() => {
          window.location.reload(); // Recargar para actualizar la tabla
      }, 2000);
      
        } catch (error) {
      console.error('Error al anular transacción:', error);
      alert('Error al anular la transacción: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      
      // Restaurar botón
      const anularBtn = document.querySelector(`[data-id="${id}"]`) as HTMLButtonElement;
      if (anularBtn) {
        anularBtn.disabled = false;
        anularBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
      }
    }
  }

  // Agregar event listeners a ambos contenedores
  transaccionesContainer.addEventListener('click', handleAnularClick);
  transaccionesContainerMobile.addEventListener('click', handleAnularClick);

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

  // Calcular resumen excluyendo transacciones anuladas
  function calculateResumen(transacciones: Transaccion[]) {
    const transaccionesActivas = transacciones.filter(t => t.estado !== 'anulada');
    
    const ingresos = transaccionesActivas
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const egresos = transaccionesActivas
      .filter(t => t.tipo === 'egreso')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const neto = ingresos - egresos;
    
    return { ingresos, egresos, neto };
  }

  // Función para formatear moneda
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Función auxiliar para evitar errores de TypeScript
  function addText(doc: any, text: any, x: number, y: number) {
    try {
      (doc as any).text(String(text || ''), x, y);
    } catch (error) {
      console.error('Error adding text:', error);
    }
  }

  // Exportar a Excel
  async function exportToExcel(transacciones: Transaccion[]) {
    try {
      const transaccionesActivas = transacciones.filter(t => t.estado !== 'anulada');
      const totalIngresos = transaccionesActivas.filter(t => t.tipo === 'ingreso').reduce((sum: number, t) => sum + t.monto, 0);
      const totalEgresos = transaccionesActivas.filter(t => t.tipo === 'egreso').reduce((sum: number, t) => sum + t.monto, 0);
      const neto = totalIngresos - totalEgresos;
      
      const fechaInicio = fechaInicioFilter.value || 'inicio';
      const fechaFin = fechaFinFilter.value || 'hoy';
      const actividadNombre = actividadFilter.value ? 
        (initialActividades.find(a => a.id === actividadFilter.value)?.nombre || 'N/A') : 'Todas';
      
      const title = `Transacciones ${fechaInicio} a ${fechaFin} - ${actividadNombre}`;
      
      const headers = [
        'Fecha', 
        'Número', 
        'Monto', 
        'Tipo', 
        'Categoría', 
        'Actividad', 
        'Estado'
      ];
      
      const data = transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-CO'),
        t.numero_transaccion || t.id,
        t.monto,
        t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
        t.categoria_nombre || 'N/A',
        t.actividad_nombre || 'N/A',
        t.estado === 'anulada' ? 'Anulada' : 'Activa'
      ]);
      
      const wb = XLSX.utils.book_new();
      const wsData = [headers, ...data];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Ajustar ancho de columnas
      ws['!cols'] = headers.map(() => ({ wch: 20 }));
      
      XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
      
      // Agregar hoja de resumen
      const summaryData = [
        ['RESUMEN DE TRANSACCIONES', ''],
        ['', ''],
        ['Total Ingresos', totalIngresos],
        ['Total Egresos', totalEgresos],
        ['Neto', neto],
        ['Total Transacciones', transacciones.length]
      ];
      
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
      
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
      
      const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, filename);
      
    } catch (error) {
      console.error('Error al exportar a Excel. Intentando CSV como fallback:', error);
      // Fallback a CSV
    const headers = ['Fecha', 'Monto', 'Tipo', 'Categoría', 'Actividad', 'Persona', 'Descripción'];
    const rows = transacciones.map(t => [
      new Date(t.fecha).toLocaleDateString('es-CO'),
      t.monto,
      t.tipo,
      t.categoria_nombre || 'N/A',
      t.actividad_nombre || 'N/A',
      t.persona_nombre || 'N/A',
      (t.descripcion || '').replace(/\n|\r/g, ' ')
    ]);
      exportToCSV([headers, ...rows], 'transacciones.csv');
    }
  }

  // Función para exportar a CSV
  function exportToCSV(data: any[][], filename: string = 'datos.csv'): void {
    const csvContent = data
      .map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Exportar a PDF
  async function exportToPDF(transacciones: Transaccion[]) {
    try {
      const transaccionesActivas = transacciones.filter(t => t.estado !== 'anulada');
      const totalIngresos = transaccionesActivas.filter(t => t.tipo === 'ingreso').reduce((sum: number, t) => sum + t.monto, 0);
      const totalEgresos = transaccionesActivas.filter(t => t.tipo === 'egreso').reduce((sum: number, t) => sum + t.monto, 0);
      const neto = totalIngresos - totalEgresos;
      
      const fechaInicio = fechaInicioFilter.value || 'inicio';
      const fechaFin = fechaFinFilter.value || 'hoy';
      const actividadNombre = actividadFilter.value ? 
        (initialActividades.find(a => a.id === actividadFilter.value)?.nombre || 'N/A') : 'Todas';
      
      const title = `Transacciones ${fechaInicio} a ${fechaFin} - ${actividadNombre}`;
      
      const doc = new jsPDF();
      
      // Configuración del documento
      doc.setFont('helvetica');
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175);
      
      // Título
      doc.text(title.toUpperCase(), 105, 20, { align: 'center' });
      
      // Línea decorativa
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Crear tabla manualmente (sin autoTable para evitar problemas)
      const headers = ['Fecha', 'Número', 'Monto', 'Tipo', 'Categoría', 'Estado'];
      const colWidths = [25, 25, 30, 20, 35, 20];
      const startX = 20;
      let y = 40;
      
      // Dibujar encabezados
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      let x = startX;
      headers.forEach((header, index) => {
        // Fondo azul para encabezados
        doc.setFillColor(30, 64, 175);
        doc.rect(x, y - 5, colWidths[index], 8, 'F');
        addText(doc, header, x + 2, y);
        x += colWidths[index];
      });
      
      // Línea debajo de encabezados
      y += 3;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(startX, y, startX + colWidths.reduce((a, b) => a + b, 0), y);
      y += 5;
      
      // Dibujar filas de datos
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      
      transacciones.forEach((t, index) => {
        // Verificar si necesitamos nueva página
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        
        // Fondo alternado para filas
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(startX, y - 3, colWidths.reduce((a, b) => a + b, 0), 4, 'F');
        }
        
        const rowData = [
        new Date(t.fecha).toLocaleDateString('es-CO'),
          t.numero_transaccion || t.id,
          formatCurrency(t.monto),
          t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
        t.categoria_nombre || 'N/A',
          t.estado === 'anulada' ? 'Anulada' : 'Activa'
        ];
        
        x = startX;
        rowData.forEach((cell, colIndex) => {
          const cellText = String(cell || '');
          // Truncar texto si es muy largo
          const truncatedText = cellText.length > 15 ? cellText.substring(0, 12) + '...' : cellText;
          addText(doc, truncatedText, x + 2, y);
          x += colWidths[colIndex];
        });
        
        y += 4;
      });
      
      // Agregar resumen
      const finalY = y + 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      addText(doc, 'RESUMEN DE TRANSACCIONES', 20, finalY);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      addText(doc, 'Total Ingresos:', 20, finalY + 10);
      doc.setFont(undefined, 'bold');
      addText(doc, formatCurrency(totalIngresos), 80, finalY + 10);
      doc.setFont(undefined, 'normal');
      
      addText(doc, 'Total Egresos:', 20, finalY + 20);
      doc.setFont(undefined, 'bold');
      addText(doc, formatCurrency(totalEgresos), 80, finalY + 20);
      doc.setFont(undefined, 'normal');
      
      addText(doc, 'Neto:', 20, finalY + 30);
      doc.setFont(undefined, 'bold');
      addText(doc, formatCurrency(neto), 80, finalY + 30);
      doc.setFont(undefined, 'normal');
      
      addText(doc, 'Total Transacciones:', 20, finalY + 40);
      doc.setFont(undefined, 'bold');
      addText(doc, transacciones.length.toString(), 80, finalY + 40);
      
      // Pie de página
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${i} de ${pageCount}`,
          (doc as any).internal.pageSize.width - 20,
          (doc as any).internal.pageSize.height - 10,
          { align: 'right' }
        );
        doc.text(
          new Date().toLocaleString('es-CO'),
          20,
          (doc as any).internal.pageSize.height - 10
        );
      }
      
      // Guardar el documento
      const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
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
    const totalPages = Math.ceil(currentTransacciones.length / itemsPerPage) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      renderTransacciones();
    }
  });

  exportExcelButton?.addEventListener('click', () => {
    exportToExcel(currentTransacciones);
  });
  exportPdfButton?.addEventListener('click', () => {
    exportToPDF(currentTransacciones);
  });

  

  // Render inicial
  renderTransacciones();
}
