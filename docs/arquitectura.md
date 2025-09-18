# Arquitectura del Proyecto: appfiladelfia2

Este documento describe la estructura principal del proyecto, los módulos clave y un diagrama de rutas (páginas y APIs) para facilitar la navegación y el onboarding del equipo.

## Estructura de Carpetas

```text
appfiladelfia2/
├─ .env
├─ astro.config.mjs
├─ tailwind.config.mjs
├─ tsconfig.json
├─ package.json
├─ README.md
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ Preloader.astro
│  │  └─ Welcome.astro
│  ├─ data/
│  │  └─ colombia.json
│  ├─ layouts/
│  │  ├─ Layout.astro
│  │  └─ LayoutProtected.astro
│  ├─ lib/
│  │  └─ supabase.ts
│  ├─ models/
│  │  ├─ actividad.model.ts
│  │  ├─ categoria.model.ts
│  │  ├─ persona.model.ts
│  │  └─ transaccion.model.ts
│  ├─ pages/
│  │  ├─ api/
│  │  │  ├─ contabilidad/
│  │  │  │  ├─ actividades.ts
│  │  │  │  ├─ actividades/[id].ts
│  │  │  │  ├─ transacciones.ts
│  │  │  │  └─ transacciones/[id].ts
│  │  │  ├─ personas/
│  │  │  │  └─ buscar.ts (y otros, p.ej. upload)
│  │  │  ├─ personas.ts
│  │  │  ├─ id-checker.ts
│  │  │  ├─ login.ts
│  │  │  └─ logout.ts
│  │  ├─ contabilidad/
│  │  │  ├─ actividades.astro
│  │  │  ├─ index.astro
│  │  │  ├─ nueva-transaccion.astro
│  │  │  ├─ transacciones.astro
│  │  │  └─ actividades/[id]/(editar.astro|seguimiento.astro)
│  │  ├─ personas/
│  │  │  ├─ index.astro
│  │  │  ├─ nueva.astro
│  │  │  └─ [id].astro
│  │  ├─ index.astro
│  │  ├─ login.astro
│  │  └─ reportes.astro
│  ├─ scripts/
│  │  ├─ personas-actions.js
│  │  ├─ personas-filters.js
│  │  └─ transacciones-filters.ts
│  ├─ services/
│  │  └─ contabilidad.service.ts
│  └─ types/
└─ supabase/
```

## Convenciones y Componentes Compartidos
- **Layout**: `layouts/Layout.astro` y `layouts/LayoutProtected.astro` definen el armazón de las páginas.
- **Preloader Global**: `components/Preloader.astro` expone `window.showPreloader(message)`, `window.showPreloaderSuccess(message)` y `window.hidePreloader()`.
- **Supabase**: `lib/supabase.ts` inicializa cliente y helpers de autenticación.
- **Modelos**: Tipados en `src/models/` para Actividad, Persona, Transacción, Categoría.
- **Scripts UI**: Filtros, paginación y exportaciones en `src/scripts/`.

## Diagrama de Rutas (Páginas)

```mermaid
flowchart TD
  subgraph Web
    A[/"/" index.astro/] --> B["/login" login.astro]
    A --> C["/personas" index.astro]
    C --> C1["/personas/nueva" nueva.astro]
    C --> C2["/personas/:id" [id].astro]

    A --> D["/contabilidad" index.astro]
    D --> D1["/contabilidad/actividades" actividades.astro]
    D1 --> D1a["/contabilidad/actividades/:id/editar" editar.astro]
    D1 --> D1b["/contabilidad/actividades/:id/seguimiento" seguimiento.astro]
    D --> D2["/contabilidad/nueva-transaccion" nueva-transaccion.astro]
    D --> D3["/contabilidad/transacciones" transacciones.astro]
    D3 --> D3a["/contabilidad/transacciones/:id" [id].astro]

    A --> E["/reportes" reportes.astro]
  end
```

## Diagrama de Endpoints (API)

```mermaid
flowchart TD
  subgraph API (Astro APIRoutes)
    P1["GET /api/contabilidad/actividades"]
    P2["GET|PUT|DELETE /api/contabilidad/actividades/:id"]
    P3["POST|GET /api/contabilidad/transacciones"]
    P4["GET|PUT /api/contabilidad/transacciones/:id"]
    P5["GET /api/contabilidad/categorias"]

    U1["POST /api/personas"]
    U2["GET /api/personas/buscar"]
    U3["POST /api/id-checker"]

    A1["POST /api/login"]
    A2["POST /api/logout"]
  end

  %% Relaciones (simplificadas)
  C1[/Nueva Persona/] --> U3
  C1 --> U1
  D2[/Nueva Transacción/] --> P3
  D3[/Listado Transacciones/] --> P3
  D3a[/Detalle Transacción/] --> P4
  D1[/Actividades/] --> P1
  D1a[/Editar Actividad/] --> P2
  D1b[/Seguimiento Actividad/] --> P1
```

## Puntos de Integración (selección)
- **Autenticación**: `pages/login.astro` consume `api/login.ts` y `api/logout.ts`; `LayoutProtected.astro` protege rutas.
- **Personas**:
  - Registro: `pages/personas/nueva.astro` → `api/personas.ts`
  - Verificación de ID: `api/id-checker.ts`
  - Búsqueda UI: `api/personas/buscar.ts`
- **Contabilidad**:
  - Actividades: `pages/contabilidad/actividades.astro` y `pages/contabilidad/actividades/[id]/editar.astro` → `api/contabilidad/actividades.ts` y `api/contabilidad/actividades/[id].ts`
  - Transacciones: `pages/contabilidad/nueva-transaccion.astro`, `pages/contabilidad/transacciones.astro` → `api/contabilidad/transacciones.ts` y `api/contabilidad/transacciones/[id].ts`

## Patrones UX Unificados
- **Preloader con mensajes**:
  - Personas (verificación y registro)
  - Contabilidad (nueva transacción, edición/eliminación de actividad, anulación de transacción)
- **Moneda (COP)**: vista previa con `Intl.NumberFormat('es-CO', { currency: 'COP' })` en inputs monetarios (ej.: `meta` en actividad, `monto` en nueva transacción).

## Próximos pasos sugeridos
- Añadir tests E2E básicos para flujos críticos (registro persona, nueva transacción, editar actividad).
- Documentar variables de entorno en `.env.example`.
- Centralizar helpers de formateo (moneda/fecha) en `src/lib/`.
