# POWSI Veterinaria

Sitio web en React + Vite para POWSI, una veterinaria con paginas de inicio, perfil de mascota, agenda, nosotros y contacto.

La navegación es una SPA: los enlaces internos usan History API y actualizan la vista sin recargar el documento. Los enlaces externos, las descargas, los modificadores del navegador y destinos en otra pestaña conservan el comportamiento nativo.

Rutas disponibles: `/`, `/mi-mascota`, `/agendar`, `/nosotros` y `/contacto`. Las rutas desconocidas muestran una página 404. Los formularios de agenda y perfil se procesan en React y no envían el documento.

## Publicacion

El proyecto se publica en GitHub Pages mediante GitHub Actions.

- Repositorio: https://github.com/caminazz-solano/spapowsicamisolano
- Sitio: https://caminazz-solano.github.io/spapowsicamisolano/
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

Vite muestra la URL local, que incluye la base `/spapowsicamisolano/` configurada para GitHub Pages.

## Produccion

```bash
npm run build
npm run preview
```

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
