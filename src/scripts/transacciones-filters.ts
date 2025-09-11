// src/scripts/transacciones-filters.ts
// Importación correcta
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Uso
const doc = new jsPDF();
// doc.save('documento.pdf');

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
  
    // Formatear moneda
    function formatCurrency(amount: number): string {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
    }
  
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
              <td class="px-6 py-4">${new Date(t.fecha).toLocaleDateString('es-CO')}</td>
              <td class="px-6 py-4">${formatCurrency(t.monto)}</td>
              <td class="px-6 py-4">${t.tipo}</td>
              <td class="px-6 py-4">${t.categoria_nombre || 'Sin categoría'}</td>
              <td class="px-6 py-4">${t.actividad_nombre || 'N/A'}</td>
              <td class="px-6 py-4">${t.persona_nombre || 'N/A'}</td>
              <td class="px-6 py-4">${t.descripcion || ''}</td>
              <td class="px-6 py-4 text-right">
                <a href="/contabilidad/transacciones/${t.id}" class="text-blue-600 hover:underline">Ver</a>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="8" class="px-6 py-4 text-center">No hay transacciones para mostrar</td></tr>`;
  
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
              <div class="mt-2">
                <a href="/contabilidad/transacciones/${t.id}" class="text-blue-600 hover:underline">Ver</a>
              </div>
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
  
    // Exportar a Excel (con fallback)
    async function exportToExcel(transacciones: Transaccion[]) {
      try {
        let XLSX: any;
        try {
          // @ts-ignore - import dinámico en runtime
          XLSX = await import('xlsx');
        } catch (_) {
          // @ts-ignore - import desde CDN sin tipos
          XLSX = await import('https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs');
        }
        const wb = XLSX.utils.book_new();
        const wsData = transacciones.map(t => ({
          'Fecha': new Date(t.fecha).toLocaleDateString('es-CO'),
          'Monto': t.monto,
          'Tipo': t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
          'Categoría': t.categoria_nombre || 'N/A',
          'Actividad': t.actividad_nombre || 'N/A',
          'Persona': t.persona_nombre || 'N/A',
          'Descripción': t.descripcion || ''
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
        const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((sum: number, t) => sum + t.monto, 0);
        const totalEgresos = transacciones.filter(t => t.tipo === 'egreso').reduce((sum: number, t) => sum + t.monto, 0);
        const neto = totalIngresos - totalEgresos;
        const resumenData = [
          ['RESUMEN DE TRANSACCIONES', ''],
          ['', ''],
          ['Filtros aplicados:', ''],
          ['Fecha inicio', fechaInicioFilter.value || 'No especificado'],
          ['Fecha fin', fechaFinFilter.value || 'No especificado'],
          ['Actividad', actividadFilter.value ? 
            (initialActividades.find(a => a.id === actividadFilter.value)?.nombre || 'N/A') : 'Todas'],
          ['', ''],
          ['TOTALES', ''],
          ['Total Ingresos', totalIngresos],
          ['Total Egresos', totalEgresos],
          ['Neto', neto]
        ];
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        ws['!cols'] = [
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 40 }
        ];
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
        const fechaInicio = fechaInicioFilter.value || 'inicio';
        const fechaFin = fechaFinFilter.value || 'hoy';
        XLSX.writeFile(wb, `transacciones_${fechaInicio}_a_${fechaFin}.xlsx`);
      } catch (error) {
        console.error('Error al exportar a Excel. Intentando CSV como fallback:', error);
        exportToCSV(transacciones);
      }
    }
  
    function exportToCSV(transacciones: Transaccion[]) {
      const headers = ['Fecha','Monto','Tipo','Categoría','Actividad','Persona','Descripción'];
      const rows = transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-CO'),
        t.monto,
        t.tipo,
        t.categoria_nombre || 'N/A',
        t.actividad_nombre || 'N/A',
        t.persona_nombre || 'N/A',
        (t.descripcion || '').replace(/\n|\r/g, ' ')
      ]);
      const csvContent = [headers, ...rows].map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transacciones.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  
    // Exportar a PDF
    async function exportToPDF(transacciones: Transaccion[]) {
      try {
        const doc = new jsPDF();
        const headers = [['Fecha', 'Monto', 'Tipo', 'Categoría', 'Actividad', 'Persona', 'Descripción']];
        
        const data = transacciones.map(t => [
          new Date(t.fecha).toLocaleDateString('es-CO'),
          new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(t.monto),
          t.tipo,
          t.categoria_nombre || 'N/A',
          t.actividad_nombre || 'N/A',
          t.persona_nombre || 'N/A',
          t.descripcion || ''
        ]);
    
        // Usa autoTable directamente del import
        autoTable(doc, {
          head: headers,
          body: data,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
    
        doc.save('transacciones.pdf');
      } catch (error) {
        console.error('Error al exportar a PDF:', error);
        alert('Error al generar el PDF: ' + (error as Error).message);
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