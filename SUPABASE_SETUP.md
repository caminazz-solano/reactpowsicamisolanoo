# Configuración de Supabase

## Entorno

- Aplicación: React 19 + Vite + JavaScript; npm.
- SDK: `@supabase/supabase-js` v2.
- Supabase CLI: v3.1.0, dependencia local de desarrollo; invocarla con `npx supabase`.
- Alcance: Supabase Cloud; no se requiere iniciar Docker ni `supabase start`.

## Estado actual

- La CLI está autenticada y el proyecto remoto existente `caminazz-solano's Project` está enlazado localmente (`rofpcefkccfwccwfncbj`, región `us-west-2`). No se creó un proyecto duplicado.
- `.env.local` está configurado con la URL del proyecto y la clave publicable, y `.gitignore` lo excluye.
- El código inicia una sesión anónima de Supabase en segundo plano; no hay formularios ni se muestra el correo.
- Se habilitó `auth.enable_anonymous_sign_ins` en el proyecto remoto y en `supabase/config.toml`. La URL local de retorno añadida para el flujo anterior por correo se retiró.
- Las migraciones `20261118161000_powsi_profiles_and_notes.sql` y `20261124013000_create_appointment_requests.sql` están aplicadas; `npx supabase migration list --remote` confirma ambas en local y remoto.
- Existen las tablas `owner_accounts`, `veterinarian_accounts`, `pet_profiles`, `pet_notes` y `appointment_requests` en `public`. RLS está habilitado y se verificaron las políticas.
- Las consultas anónimas a las cuatro tablas originales se denegaron con `42501`; el acceso anónimo a `appointment_requests` se deniega con HTTP 401. El `SELECT`/`INSERT` de citas se limita a la sesión autenticada del dueño.
- `npx supabase db lint --remote --schema public` no encontró errores de esquema. El asesor de seguridad sí muestra un aviso sobre `public.rls_auto_enable()`, función registrada como el event trigger `ensure_rls`; no se cambió su ACL.
- No se modificaron los proveedores ni la plantilla de correo de Auth. Las solicitudes de cita ahora se insertan en Supabase; guardar una solicitud no reserva ni confirma un horario.
- La interacción de guardado de citas desde el navegador aún no se ha probado de extremo a extremo.
- El PDF disponible es un informe de preparación y no especifica permisos CRUD completos. Se aplicó la matriz RLS de la migración existente tras aprobación explícita; pruebas de CRUD/RLS con sesiones Auth pasaron usando el SDK.
- Se crearon y eliminaron cuentas/datos ficticios de prueba sin enviar correos; una consulta posterior confirmó que las tablas y cuentas temporales quedaron vacías.
- Los datos de sesiones anónimas quedan vinculados a ese navegador. Si se borran sus datos locales o se usa otro dispositivo, no se puede recuperar esa sesión.

## Variables de entorno

La plantilla versionable `.env.example` contiene:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_with_project_key
```

`.env.local` debe mantener los valores reales localmente. Solo se permite la clave publicable en el frontend. Nunca pongas tokens de acceso, contraseñas, `sb_secret_*` o `service_role` en código, Git o variables `VITE_*`.

Para desarrollo:

```sh
npm install
npm run dev
```

Vite debe reiniciarse después de cambiar `.env.local`. La validación previa a la compilación comprueba el formato de la clave configurada:

```sh
npm run test:supabase-key
npm run build
```

Para GitHub Pages, el workflow lee `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` de variables del repositorio. Ambas se configuraron en `caminazz-solano/reactpowsicamisolanoo`; la modificación local del workflow aún no se ha publicado. Las sesiones anónimas no requieren una URL de retorno de correo.

## Proyecto y migraciones

El proyecto remoto ya está enlazado. Verificación realizada:

```sh
npx supabase projects list
npx supabase migration list --remote
npx supabase db push --dry-run --remote
```

El dry-run mostró únicamente `20261124013000_create_appointment_requests.sql` como pendiente. Se aplicó con `npx supabase db push --remote --yes`. El dry-run no valida completamente el SQL.

Para verificar el estado aplicado:

```sh
npx supabase migration list --remote
npx supabase db lint --remote --schema public
```

Las consultas de metadatos confirmaron columnas, claves, RLS y grants; las políticas de citas permiten `SELECT`/`INSERT` al dueño y deniegan acceso anónimo. Con sesiones Auth de prueba se verificaron CRUD de dueño, permisos de veterinario asignado/no asignado, revocación y restricciones de entrada. El guardado de citas desde la UI aún requiere una prueba con una sesión real. No usar `service_role` para probar políticas de usuario.

## Pendientes de configuración

- Probar en navegador que una sesión anónima crea el perfil de propietario y conserva los datos después de recargar.
- Probar en el navegador el envío de una cita, verla en `appointment_requests` y recargar la página. El PDF no define una entidad de citas; la tabla es una extensión solicitada por la usuaria y solo registra solicitudes.
- `supabase/config.toml` configura el CLI local; los cambios remotos se aplican por separado y se verifican con `supabase config diff --remote`.
- No hay datos semilla.

Para el modelo disponible, la correspondencia con el código y los resultados de verificación, consulta `docs/supabase-integration/ANALISIS.md` y `docs/supabase-integration/CHECKLIST.md`.
