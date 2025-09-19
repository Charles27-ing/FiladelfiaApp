import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function initializeNuevaTransaccionForm() {
  document.addEventListener('DOMContentLoaded', async () => {
      
    const form = document.getElementById('transaccion-form') as HTMLFormElement;
    const tipoSelect = document.getElementById('tipo') as HTMLSelectElement;
    const categoriaSelect = document.getElementById('categoria_id') as HTMLSelectElement;
    const actividadSelect = document.getElementById('actividad_id') as HTMLSelectElement;
    const personaBuscar = document.getElementById('persona_buscar') as HTMLInputElement;
    const personaId = document.getElementById('persona_id') as HTMLInputElement;
    const resultadosDiv = document.getElementById('persona_resultados') as HTMLDivElement;
    const montoInput = document.getElementById('monto') as HTMLInputElement;
    const montoPreview = document.getElementById('monto-preview') as HTMLDivElement;
    
    if (!form || !tipoSelect || !categoriaSelect || !actividadSelect || !personaBuscar || !personaId || !resultadosDiv) {
      console.error('No se encontraron todos los elementos necesarios');
      return;
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

    // Función para formatear fecha
    function formatDate(dateString: string): string {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-CO', options);
    }

    // Manejar búsqueda de personas
    let searchTimeout: number | null = null;
    
    personaBuscar.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.trim();
      
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      if (query.length < 2) {
        resultadosDiv.innerHTML = '';
        resultadosDiv.classList.add('hidden');
        return;
      }
      
      searchTimeout = window.setTimeout(async () => {
        try {
          const response = await fetch(`/api/personas/buscar?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Error en la búsqueda');
          
          const personas = await response.json();
          
          if (personas.length === 0) {
            resultadosDiv.innerHTML = '<div class="p-2 text-gray-500">No se encontraron resultados</div>';
            resultadosDiv.classList.remove('hidden');
            return;
          }
          
          resultadosDiv.innerHTML = personas.map((persona: any) => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer" data-id="${persona.id}">
              ${persona.nombre_completo}${persona.documento_identidad ? ` (${persona.documento_identidad})` : ''}
            </div>
          `).join('');
          
          resultadosDiv.classList.remove('hidden');
          
          // Agregar manejadores de clic a los resultados
          resultadosDiv.querySelectorAll('div[data-id]').forEach(div => {
            div.addEventListener('click', () => {
              const id = div.getAttribute('data-id');
              const nombre = div.textContent?.trim().split(' (')[0] || '';
              personaId.value = id || '';
              personaBuscar.value = nombre;
              resultadosDiv.classList.add('hidden');
            });
          });
          
        } catch (error) {
          console.error('Error buscando personas:', error);
          resultadosDiv.innerHTML = '<div class="p-2 text-red-500">Error al buscar personas</div>';
          resultadosDiv.classList.remove('hidden');
        }
      }, 300);
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target !== personaBuscar && !resultadosDiv.contains(target)) {
        resultadosDiv.classList.add('hidden');
      }
    });

    // Formateo de monto con vista previa (como meta en Editar Actividad)
    if (montoInput && montoPreview) {
      montoInput.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value > 0) {
          montoPreview.textContent = `Monto: ${formatCurrency(value)}`;
          montoPreview.className = 'mt-1 text-3xl text-green-600';
        } else if (value < 0) {
          montoPreview.textContent = 'El monto debe ser un valor positivo';
          montoPreview.className = 'mt-1 text-3xl text-red-600';
          this.value = '0';
        } else {
          montoPreview.textContent = '';
          montoPreview.className = 'mt-1 text-3xl text-gray-600';
        }
      });
    }

    // Manejar envío del formulario con Preloader global
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (!submitButton) return;
      
      const originalButtonText = submitButton.innerHTML;
      try {
        // Mostrar preloader global
        if (window && (window as any).showPreloader) {
          (window as any).showPreloader('Registrando transacción...');
        }
        submitButton.disabled = true;
        submitButton.innerHTML = 'Procesando...';
        
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Error al guardar la transacción');
        }
        // Mostrar éxito con preloader y redirigir
        if (window && (window as any).showPreloaderSuccess) {
          (window as any).showPreloaderSuccess('¡Transacción guardada con éxito!');
        }
        setTimeout(() => {
          window.location.href = '/contabilidad/transacciones';
        }, 1500);

        // Limpiar el formulario
        (form as HTMLFormElement).reset();
        
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        if (window && (window as any).hidePreloader) {
          (window as any).hidePreloader();
        }
        alert(error instanceof Error ? error.message : 'Error al procesar la transacción');
        
      } finally {
        // Restaurar el botón
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      }
    });
    
    // Función para generar PDF usando el módulo reutilizable
    async function generatePDF(transaccion: any) {
      try {
        // Generar PDF directamente
        const doc = new jsPDF();
        
        // Configuración del documento
        doc.setFont('helvetica');
        doc.setFontSize(20);
        doc.setTextColor(30, 64, 175);
        
        // Título
        doc.text('COMPROBANTE DE TRANSACCIÓN', 105, 20, { align: 'center' });
        
        // Línea decorativa
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        // Información de la transacción
        let y = 40;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        // Función para agregar filas
        const addRow = (label: string, value: string, isBold = false) => {
          doc.setFont(undefined, 'bold');
          doc.text(String(label), 20, y);
          doc.setFont(undefined, isBold ? 'bold' : 'normal');
          doc.text(String(value), 80, y);
          y += 7;
        };
        
        // Datos de la transacción
        addRow('Número de Transacción:', `#${String(transaccion.numero_transaccion || transaccion.id)}`, true);
        addRow('Fecha y Hora:', String(new Date(transaccion.fecha).toLocaleString('es-CO')));
        addRow('Tipo:', String(transaccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'));
        addRow('Monto:', new Intl.NumberFormat('es-CO', { 
          style: 'currency', 
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Number(transaccion.monto)), true);
        addRow('Categoría:', String(transaccion.categoria_nombre || 'N/A'));
        if (transaccion.actividad_nombre) addRow('Actividad:', String(transaccion.actividad_nombre));
        if (transaccion.persona_nombre) addRow('Persona:', String(transaccion.persona_nombre));
        addRow('Estado:', String(transaccion.estado === 'anulada' ? 'Anulada' : 'Activa'));
        
        if (transaccion.descripcion) {
          y += 5;
          doc.setFont(undefined, 'bold');
          doc.text('Descripción:', 20, y);
          y += 7;
          doc.setFont(undefined, 'normal');
          const splitDesc = doc.splitTextToSize(String(transaccion.descripcion), 170) as unknown as string[];
          doc.text(splitDesc as string[], 20, y);
        }
        
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
        const filename = `transaccion_${transaccion.numero_transaccion || transaccion.id}.pdf`;
        doc.save(filename);
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
    
    // Función para exportar a Excel usando el módulo reutilizable
    async function exportToExcel(transaccion: any) {
      try {
        // Generar Excel directamente
        const wsData = [
          ['Campo', 'Valor'],
          ['Número de Transacción', transaccion.numero_transaccion || transaccion.id],
          ['Fecha', new Date(transaccion.fecha).toLocaleString('es-CO')],
          ['Tipo', transaccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'],
          ['Monto', transaccion.monto],
          ['Categoría', transaccion.categoria_nombre || 'N/A'],
          ['Actividad', transaccion.actividad_nombre || 'N/A'],
          ['Persona', transaccion.persona_nombre || 'N/A'],
          ['Estado', transaccion.estado === 'anulada' ? 'Anulada' : 'Activa'],
          ['Descripción', transaccion.descripcion || '']
        ];
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Ajustar ancho de columnas
        ws['!cols'] = [
          { wch: 20 },
          { wch: 30 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Transacción');
        
        const filename = `transaccion_${transaccion.numero_transaccion || transaccion.id}.xlsx`;
        XLSX.writeFile(wb, filename);
      } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al exportar a Excel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
    
    // Filtrar categorías según el tipo de transacción
    function filtrarCategorias() {
      const tipo = tipoSelect.value;
      const categorias = Array.from(categoriaSelect.options);
      
      // Mostrar/ocultar opciones según el tipo
      categorias.forEach(option => {
        if (option.value === '') return; // No ocultar la opción por defecto
        
        const categoriaTipo = option.getAttribute('data-tipo');
        if (categoriaTipo === tipo || categoriaTipo === 'ambos') {
          option.style.display = '';
        } else {
          option.style.display = 'none';
          // Si la opción seleccionada se oculta, seleccionar la opción por defecto
          if (option.selected) {
            categoriaSelect.value = '';
          }
        }
      });
    }
    
    // Inicializar filtrado de categorías
    filtrarCategorias();

    // Escuchar cambios en el tipo de transacción
    tipoSelect.addEventListener('change', filtrarCategorias);

    // Pre-seleccionar actividad si viene en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const actividadIdFromUrl = urlParams.get('actividad_id');
    if (actividadIdFromUrl && actividadSelect) {
      actividadSelect.value = actividadIdFromUrl;
    }
  });
}
