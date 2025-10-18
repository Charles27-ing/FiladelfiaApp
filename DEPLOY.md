# Guía de Despliegue en Netlify

## Configuración del Proyecto

Este proyecto está configurado para desplegarse en Netlify con las siguientes características:

### Estructura de Archivos
- **CSS y JS**: Los archivos CSS están en `src/styles/` y se importan correctamente en los layouts
- **Archivos públicos**: Los assets estáticos están en la carpeta `public/`
- **Build output**: El proyecto se construye en la carpeta `dist/`

### Configuración de Netlify

El archivo `netlify.toml` contiene la configuración necesaria:

```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## Pasos para Desplegar

### 1. Preparar el Proyecto

Asegúrate de que todas las dependencias estén instaladas:

```bash
pnpm install
```

### 2. Probar el Build Localmente

```bash
pnpm run build
```

### 3. Desplegar en Netlify

#### Opción A: Desde la CLI de Netlify

```bash
# Instalar Netlify CLI (si no está instalado)
pnpm install -g netlify-cli

# Login en Netlify
netlify login

# Desplegar
netlify deploy --prod
```

#### Opción B: Desde el Dashboard de Netlify

1. Ve a [Netlify](https://app.netlify.com/)
2. Haz clic en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de Git
4. Netlify detectará automáticamente la configuración de `netlify.toml`
5. Haz clic en "Deploy site"

### 4. Configurar Variables de Entorno

En el dashboard de Netlify, ve a:
- Site settings > Environment variables
- Agrega las siguientes variables desde tu archivo `.env`:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - Cualquier otra variable de entorno necesaria

## Solución de Problemas

### Error de build en Windows (EPERM: operation not permitted, symlink)

⚠️ **Problema conocido**: En Windows, el build puede fallar con un error de permisos al crear symlinks:
```
EPERM: operation not permitted, symlink
```

**Soluciones**:
1. **Opción recomendada**: Desplegar directamente desde Git en Netlify (el build se hace en Linux)
2. **Opción alternativa**: Ejecutar el terminal como Administrador y hacer el build
3. **Para desarrollo**: Usar `pnpm run dev` que funciona sin problemas

**Nota**: Este error solo ocurre en Windows durante el build local. El despliegue en Netlify funcionará correctamente porque usa Linux.

### CSS o JS no se cargan

✅ **Solucionado**: 
- Los archivos CSS ahora se importan correctamente usando la sintaxis de Astro:
```javascript
import '../styles/layout-protected.css';
```
- Los scripts JavaScript deben usar **rutas relativas** en lugar de rutas absolutas:
  - ❌ Incorrecto: `import { func } from '/src/scripts/file.js';`
  - ✅ Correcto: `import { func } from '../../scripts/file.js';`
- Astro procesa y empaqueta estos archivos automáticamente durante el build

### Error de clave duplicada en transacciones

✅ **Solucionado**: El `numero_transaccion` ahora usa un formato único:
```javascript
const numero_transaccion = `${tipo_prefix}-${timestamp}-${randomSuffix}-${uniqueId}`;
```

### Filtros rápidos no funcionan

✅ **Solucionado**: Se agregaron validaciones y prevención de comportamiento por defecto en los event listeners.

## Verificación Post-Despliegue

Después del despliegue, verifica:

1. ✅ Los estilos CSS se cargan correctamente
2. ✅ Los scripts JavaScript funcionan
3. ✅ Las rutas dinámicas funcionan (gracias a la configuración de redirects)
4. ✅ Las funciones serverless de Astro funcionan correctamente
5. ✅ La conexión con Supabase funciona

## Comandos Útiles

```bash
# Desarrollo local
pnpm run dev

# Build de producción
pnpm run build

# Preview del build
pnpm run preview

# Despliegue en Netlify
netlify deploy --prod
```

## Notas Importantes

- El proyecto usa **Astro 5.x** con el adaptador **@astrojs/netlify 6.x**
- El modo de output es `server` (SSR habilitado)
- Tailwind CSS está configurado como integración
- Los archivos estáticos deben estar en la carpeta `public/`
