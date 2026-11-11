# Configuración inicial de Supabase

## Entorno detectado

- Sistema: Windows 10, x64.
- Node.js: v24.19.0.
- npm: 11.17.0 (`npm.cmd` se usa porque la política de PowerShell bloquea `npm.ps1`).
- Aplicación: React 19 con Vite; gestor de paquetes npm.
- Supabase CLI: v3.1.0, instalada como dependencia de desarrollo con `npm install --save-dev supabase`.
- SDK: `@supabase/supabase-js` v2, dependencia de ejecución.
- Alcance: Supabase Cloud. No se instaló ni utilizó Docker ni se inició un stack local.

## Estado

| Componente | Estado |
|---|---|
| CLI | Instalada y verificada con `npx supabase --version` (3.1.0). |
| Inicialización local | Completa con `npx supabase init`; existe `supabase/config.toml`. |
| SDK | Instalado en `package.json`. |
| Cliente central | Creado en `src/lib/supabase.js`; requiere las variables de entorno antes de importarse. |
| Variables de ejemplo | Definidas en `.env.example`; se excluyen los archivos `.env*` reales del control de versiones, con excepción de `.env.example`. |
| Validación de compilación | `npm run build` completado; también se compiló el módulo cliente con valores ficticios no persistidos. |
| Autenticación CLI | Pendiente. `npx supabase projects list` devolvió `AccessTokenRequiredError`. No se solicitó ni se guardó ningún token. |
| Proyecto Cloud vinculado | Pendiente de autenticación y selección del proyecto. No se enlazó ni modificó ningún proyecto remoto. |
| URL y publishable key reales | Pendientes de seleccionar el proyecto Cloud. No se incluyen credenciales en el repositorio. |

## Configuración de entorno

Crear `.env.local` a partir de `.env.example` y sustituir los valores de ejemplo por los datos del proyecto seleccionado:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

La publishable key está destinada al cliente web y no sustituye autorización. No poner claves `service_role`, claves secretas ni tokens de acceso en variables `VITE_*`, porque Vite las expone al bundle del navegador. La configuración actual no usa ninguna tabla ni ejecuta operaciones contra la base de datos.

## Archivos creados o modificados

- `package.json` y `package-lock.json`: CLI como dependencia de desarrollo y SDK como dependencia de ejecución.
- `supabase/config.toml` y `supabase/.gitignore`: estructura local creada por `supabase init`.
- `.gitignore`: exclusión de `.env` y `.env.*`; `.env.example` permanece versionable.
- `.env.example`: nombres de variables requeridas con valores ilustrativos.
- `src/lib/supabase.js`: creación singleton del cliente con validación explícita de configuración faltante.
- `SUPABASE_SETUP.md`: esta guía.

## Completar autenticación y vinculación

La autenticación debe realizarla la persona propietaria de la cuenta en un terminal local interactivo. No compartir tokens de acceso en el chat ni guardarlos en el repositorio.

1. En un terminal situado en la raíz del proyecto, ejecutar `npx supabase login` y completar el flujo privado indicado por la CLI.
2. Ejecutar `npx supabase projects list` y escoger el proyecto Cloud correcto.
3. Enlazarlo con `npx supabase link --project-ref <project-ref>`.
4. Verificar que `npx supabase projects list` incluya el proyecto elegido y que `npx supabase link` finalice indicando que el enlace se completó.
5. Obtener la URL y publishable key del proyecto desde la configuración de API del dashboard de Supabase, guardarlas solo en `.env.local` y reiniciar Vite.
6. Confirmar la compilación con `npm run build`.

No ejecutar `supabase start`, ni comandos de migración/push, ni aplicar cambios a la base de datos remota como parte de esta preparación.

## Comandos útiles

```powershell
npx supabase --version
npx supabase login
npx supabase projects list
npx supabase link --project-ref <project-ref>
npm run dev
npm run build
```

## Pendiente antes de comenzar la integración

- Completar `supabase login` de forma interactiva en el equipo.
- Elegir el proyecto correcto si la cuenta devuelve más de uno y vincularlo.
- Configurar `.env.local` con la URL y publishable key de ese proyecto.
- No crear tablas, migraciones, autenticación de usuarios ni lógica de negocio sin requisitos y autorización explícitos.

La comprobación aislada del cliente usó `https://example.supabase.co` y una clave de prueba ficticia como variables de proceso; no se guardaron en archivos, no se conectó con Supabase Cloud y los artefactos temporales se eliminaron.
