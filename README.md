# POWSI Veterinaria

Sitio web en React + Vite para POWSI, una veterinaria con paginas de inicio, perfil de mascota, agenda, nosotros y contacto.

La navegación es una SPA: los enlaces internos usan History API y actualizan la vista sin recargar el documento. Los enlaces externos, las descargas, los modificadores del navegador y destinos en otra pestaña conservan el comportamiento nativo.

Al cambiar de vista con navegación interna, el foco se mueve al encabezado principal y una región `aria-live` anuncia el título para tecnologías de asistencia.

Rutas disponibles: `/`, `/cuenta`, `/mi-mascota`, `/agendar`, `/nosotros` y `/contacto`. Las rutas desconocidas muestran una página 404. `/cuenta` abre directamente el espacio de mascotas. No hay pantallas ni campos de correo: Supabase crea una sesión anónima en segundo plano y RLS mantiene los datos separados por sesión. Ese espacio se conserva en este navegador; no se puede recuperar desde otro dispositivo ni después de borrar sus datos. Las solicitudes de cita todavía se preparan localmente y se confirman por WhatsApp; el historial y las vacunas son ilustrativos.

## Publicacion

El proyecto se publica en GitHub Pages mediante GitHub Actions.

- Repositorio: https://github.com/caminazz-solano/reactpowsicamisolanoo
- Sitio: https://caminazz-solano.github.io/reactpowsicamisolanoo/
- Rama de publicacion: `main`
- Vite genera las rutas y los recursos con el prefijo del repositorio definido en `vite.config.js`.
- El build genera `404.html` como fallback de GitHub Pages para que las rutas internas funcionen también al abrirlas directamente.

## Requisitos

- Node.js
- npm

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Vite muestra la URL local, que incluye la base `/reactpowsicamisolanoo/` configurada para GitHub Pages.

## Produccion

```bash
npm run build
npm run preview
```

## Supabase

1. Copia `.env.example` a `.env.local`.
2. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con los datos del proyecto. Usa solo la clave publicable en el cliente; nunca pongas una clave secreta ni `service_role` en una variable `VITE_*`.
3. Ejecuta `npm run dev`. Para compilar con la configuración local usa `npm run build`; para verificar el formato de la clave, `npm run test:supabase-key`.
4. Revisa `SUPABASE_SETUP.md` y `docs/supabase-integration/CHECKLIST.md` para el estado de migraciones y las pruebas pendientes.

La configuración local `.env.local` está excluida de Git. La publicación en GitHub Pages también necesita variables de build configuradas en el flujo de GitHub; no se deben guardar credenciales en el repositorio.

## Archivos incluidos en GitHub

- `src/`: componentes, paginas, estilos, datos y logotipos utilizados por la app.
- `.github/workflows/deploy.yml`: compilacion y publicacion automatica en Pages.
- `index.html`, `vite.config.js`, `package.json` y `package-lock.json`: entrada y configuracion del proyecto.

## Archivos excluidos

- `node_modules/`: dependencias instaladas localmente.
- `dist/`: build generado.
- `.docs/`: material legacy y referencias locales usadas durante el desarrollo.
- `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` y `public/favicon.svg`, `public/icons.svg`: recursos de plantilla no usados.
- `src/App.css` y `src/index.css`: estilos iniciales de Vite que no usa la aplicacion POWSI.
