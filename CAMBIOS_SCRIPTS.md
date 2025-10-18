# Corrección de Rutas de Scripts para Producción

## Problema Identificado

En el despliegue de Netlify, los archivos JavaScript mostraban error 404 porque usaban rutas absolutas que no funcionan en producción:

```javascript
// ❌ NO FUNCIONA EN PRODUCCIÓN
import { func } from '/src/scripts/file.js';
```

## Solución Aplicada

### Cambio 1: Rutas Relativas
Se cambiaron todas las importaciones a **rutas relativas**:

```javascript
// ✅ FUNCIONA EN PRODUCCIÓN
import { func } from '../../scripts/file.js';
```

### Cambio 2: Separar Scripts con define:vars
**Problema crítico descubierto**: `define:vars` no es compatible con imports de módulos ES6.

**Solución**: Separar en dos scripts:
```astro
<!-- Script 1: Pasar datos con define:vars -->
<script define:vars={{ data }}>
  window.myData = data;
</script>

<!-- Script 2: Importar módulos -->
<script>
  import { myFunction } from '../../scripts/file.js';
  // Usar window.myData aquí
</script>
```

## Archivos Corregidos

### 1. `/src/pages/personas/index.astro`
**Antes:**
```javascript
import { initializePersonasFilters } from '/src/scripts/personas-filters.js';
import { initializePersonasActions, viewPerson, editPerson, deletePerson } from '/src/scripts/personas-actions.js';
```

**Después:**
```astro
<!-- Pasar datos a window primero -->
<script define:vars={{ personasConEscalasYMinisterios }}>
  window.personasData = personasConEscalasYMinisterios;
</script>

<!-- Importar y ejecutar scripts -->
<script>
  import { initializePersonasFilters } from '../../scripts/personas-filters.js';
  import { initializePersonasActions, viewPerson, editPerson, deletePerson } from '../../scripts/personas-actions.js';
  // ... resto del código
</script>
```

### 2. `/src/pages/contabilidad/transacciones.astro`
**Antes:**
```javascript
import { initializeTransaccionesFilters } from '/src/scripts/transacciones-filters.ts';
```

**Después:**
```javascript
import { initializeTransaccionesFilters } from '../../scripts/transacciones-filters.ts';
```

## Cómo Funciona

1. **En Desarrollo**: Astro puede resolver tanto rutas absolutas como relativas
2. **En Producción**: Astro empaqueta los archivos y las rutas absolutas `/src/` no existen
3. **Rutas Relativas**: Funcionan en ambos entornos porque son relativas al archivo actual

## Estructura de Rutas

```
src/
├── pages/
│   ├── personas/
│   │   └── index.astro          → usa ../../scripts/
│   └── contabilidad/
│       └── transacciones.astro  → usa ../../scripts/
└── scripts/
    ├── personas-filters.js
    ├── personas-actions.js
    └── transacciones-filters.ts
```

## Verificación

Después de estos cambios:
- ✅ Los scripts se cargan correctamente en desarrollo
- ✅ Los scripts se cargan correctamente en producción (Netlify)
- ✅ No hay errores 404
- ✅ Los filtros y acciones funcionan correctamente

## Próximos Pasos

1. Hacer un nuevo build: `pnpm run build`
2. Desplegar en Netlify: `netlify deploy --prod`
3. Verificar que los scripts funcionen en producción
