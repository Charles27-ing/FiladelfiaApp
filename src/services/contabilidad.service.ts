import type { Actividad } from '../models/actividad.model';
import type { Categoria } from '../models/categoria.model';
import type { Transaccion } from '../models/transaccion.model';



export class ContabilidadService {
  async getCategorias(): Promise<Categoria[]> {
    const res = await fetch('/api/contabilidad/categorias');
    return res.json();
  }

  async crearTransaccion(data: Omit<Transaccion, 'id' | 'created_at' | 'updated_at'>): Promise<Transaccion> {
    const res = await fetch('/api/contabilidad/transacciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Similar para actividades, getTransaccionesPorActividad(id), etc.
  async calcularGananciaActividad(id: string): Promise<{ ingresos: number; egresos: number; neto: number }> {
    const res = await fetch(`/api/contabilidad/actividades/${id}`);
    const { resumen } = await res.json();
    return resumen;
  }
}