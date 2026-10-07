# POWSI Veterinaria

Sitio web en React + Vite para POWSI, una veterinaria con paginas de inicio, perfil de mascota, agenda, nosotros y contacto.

## Publicacion

El proyecto se publica en GitHub Pages mediante GitHub Actions.

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

## Produccion

```bash
npm run build
npm run preview
```

## Archivos incluidos en GitHub

- `src/`: componentes, paginas, estilos y datos de la app.
- `public/`: recursos publicos usados por Vite.
- `index.html`, `vite.config.js`, `package.json` y `package-lock.json`: configuracion del proyecto.

## Archivos excluidos

- `node_modules/`: dependencias instaladas localmente.
- `dist/`: build generado.
- `.docs/`: material legacy y referencias locales usadas durante el desarrollo.
- Assets de plantilla no usados.
- `src/App.css` y `src/index.css`: estilos iniciales de Vite que no usa la aplicacion POWSI.
