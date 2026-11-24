# Checklist de integración Supabase — POWSI

**Fuente:** `docs/ER-CRUD.pdf`
**Estado:** esquema/RLS desplegados; CRUD de perfiles/notas probado; la pantalla de correo fue retirada y el dashboard abre con Auth anónimo en segundo plano. Falta comprobar el primer inicio anónimo desde el navegador.

## Etapas

- [x] Revisar el proyecto y validar el PDF. Evidencia: inspección de `package.json`, flujos React, texto de las 3 páginas con PDF.js y HTML fuente. No hay diagrama ER ni CRUD visual; la tabla de la página 2 es de pruebas. Render de imagen intentado pero no completado por incompatibilidad temporal de canvas.
- [x] Documentar el modelo disponible y su correspondencia con la aplicación. Evidencia: `ANALISIS.md` distingue lo que indica el PDF del modelo complementario y registra la matriz concreta aprobada para esta migración.
- [x] Crear o identificar el proyecto remoto y enlazarlo mediante CLI. Evidencia: `supabase orgs list` devolvió una organización; `projects list` devolvió el proyecto POWSI existente; `supabase link --project-ref rofpcefkccfwccwfncbj` terminó correctamente. No se creó otro proyecto.
- [x] Crear, aplicar y verificar migraciones y permisos. Evidencia: dos migraciones en historial remoto; cinco tablas, RLS y políticas consultadas; `db lint` sin errores; acceso anónimo denegado; permisos de dueño/veterinario probados con Auth.
- [x] Configurar el SDK y las variables de entorno. Evidencia: `@supabase/supabase-js` está instalado; `.env.local` contiene la URL y la clave publicable del proyecto y `git check-ignore -v .env.local` confirma que se ignora. `auth.enable_anonymous_sign_ins` está habilitado remotamente y en `supabase/config.toml`.
- [x] Integrar y comprobar cada operación CRUD requerida. Evidencia: todas las operaciones de perfiles/notas se ejecutaron con `supabase-js` y sesiones Auth; corresponden a las consultas de `usePetProfiles.js`. No se automatizó la interacción visual de los formularios.
- [x] Verificar persistencia, permisos y funcionamiento del proyecto. Evidencia: inserciones, lecturas, actualizaciones, borrados, denegaciones/revocación correctas; los datos y usuarios ficticios se limpiaron y se verificó que no quedaran filas.
- [x] Documentar la ejecución y los pendientes. Evidencia: `ANALISIS.md`, este checklist y `SUPABASE_SETUP.md`.

## CRUD por entidad y operación

Los estados de esta tabla describen el código y la verificación remota; no convierten los permisos propuestos en requisitos.

| Entidad/operación | Estado y evidencia |
|---|---|
| Cuenta de dueño — crear | `[x]` Trigger probado con metadata `account_type=owner`; el cliente ahora inicia una sesión anónima con esa metadata. La primera creación desde navegador queda pendiente de prueba. |
| Cuenta de dueño — leer | `[x]` Select de la cuenta propia con sesión Auth, como en AuthContext. |
| Cuenta de dueño — iniciar sesión | `[ ]` Sesión anónima transparente implementada; falta verificar creación/restauración en navegador y persistencia después de recargar. |
| Cuenta de dueño — actualizar/eliminar | `[ ]` No hay flujo en la UI; no se agregó CRUD no solicitado. |
| Cuenta veterinaria — crear | `[x]` Fila de prueba provisionada por operación administrativa; no existe alta pública. |
| Cuenta veterinaria — leer | `[x]` Veterinario leyó su cuenta; dueño leyó el registro de directorio conforme a la política aprobada. |
| Cuenta veterinaria — actualizar/eliminar | `[ ]` No hay flujo de UI; borrado de cuenta veterinaria no probado. |
| Perfil — crear | `[x]` `addPet`/insert de dueño, persistencia verificada. |
| Perfil — leer | `[x]` Dueño leyó propio; veterinario no asignado no vio fila y el asignado sí. |
| Perfil — actualizar | `[x]` Dueño actualizó; asignación/revocación cambió acceso del veterinario inmediatamente. |
| Perfil — eliminar | `[x]` Dueño eliminó el perfil tras borrar las notas (regla `RESTRICT`). |
| Nota — crear | `[x]` Dueño y veterinario asignado crearon notas; datos persistieron. |
| Nota — leer | `[x]` Dueño/veterinario asignado leyeron; veterinario no asignado/revocado no recibió filas. |
| Nota — actualizar | `[x]` Dueño y veterinario asignado actualizaron notas; revocado no mantuvo acceso. |
| Nota — eliminar | `[x]` Dueño eliminó; veterinario asignado no pudo eliminar. |
| Solicitud de cita — tabla y RLS | `[x]` Migración `20261124013000_create_appointment_requests.sql` aplicada. Catálogo remoto confirma columnas, RLS, políticas de dueño y grants; `anon` no tiene acceso. |
| Solicitud de cita — crear/leer con Auth | `[x]` Sesión anónima creada; inserción y lectura PostgREST autenticadas verificadas con dato ficticio; solicitud y cuenta de prueba eliminadas después. |
| Solicitud de cita — guardar desde el formulario React | `[ ]` Inserción implementada en `AppointmentPage.jsx`; build correcto. Falta enviar el formulario visual desde el navegador y verificarlo en Supabase. |
| Solicitud de cita — leer/actualizar/cancelar desde UI | `[ ]` La política permite al dueño leer sus solicitudes, pero todavía no hay historial, edición ni cancelación en la interfaz. |
| Historial/vacunas/tratamientos | `[ ]` Datos ilustrativos en `PetDashboardPage.jsx`; no hay entidad ni CRUD en la fuente disponible. |

## Comprobaciones realizadas

- CLI local: Supabase v3.1.0; organización única y proyecto remoto existente identificados.
- Proyecto `caminazz-solano's Project` (`rofpcefkccfwccwfncbj`, `us-west-2`) enlazado localmente.
- `supabase db push --dry-run --remote` mostró únicamente la migración de citas como pendiente; `supabase db push --remote --yes` la aplicó.
- `supabase migration list --remote` confirma `20261118161000` y `20261124013000` tanto local como remotamente.
- Consulta remota de solo lectura confirmó columnas de `appointment_requests`, RLS activo, políticas de lectura/creación del dueño y privilegios efectivos: `authenticated` puede leer/insertar; `anon` no puede leer/insertar y `authenticated` no puede actualizar.
- Prueba con Auth/PostgREST: dueño anónimo temporal creado, cita ficticia insertada y leída con la clave publicable; después se borraron la solicitud y el usuario de prueba. Consultas posteriores confirmaron cero filas/cuentas temporales residuales.
- `supabase db lint --remote --schema public`: sin errores después de la nueva migración.
- Consultas anónimas a las cuatro tablas originales: denegadas con `42501`; solicitud de cita denegada con HTTP 401. Las pruebas previas de perfiles/notas quedaron sin filas ni usuarios temporales.
- `supabase db lint --remote --schema public`: sin errores de esquema.
- CRUD autenticado: dueño crea/lee/actualiza/elimina perfiles y notas; veterinario no asignado y revocado no lee; asignado lee/crea/actualiza notas y no puede borrarlas. Revocación comprobada en una sesión ya abierta.
- Validación: edad fuera de rango y notas vacías/mayores a 500 caracteres rechazadas por constraints (`23514`); no persistieron.
- Cuentas Auth temporales confirmadas administrativamente para pruebas; no se enviaron correos y se eliminaron junto con los datos.
- `supabase config push` habilitó únicamente `auth.enable_anonymous_sign_ins` tras revisar un diff aislado; se retiró la URL local de retorno que ya no necesita el flujo.
- `supabase db advisors --remote --type security --level warn`: warning en la función `SECURITY DEFINER` `public.rls_auto_enable()`, registrada como event trigger `ensure_rls`; sus permisos no se cambiaron.
- `npm run build`: correcto con `.env.local`.
- `npm run test:supabase-key`: 2 pruebas aprobadas.
- `git diff --check`: correcto.
- GitHub Pages: los cambios locales del workflow inyectan `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`; las variables del repositorio de destino se configuraron sin mostrar sus valores. El workflow todavía no se ha publicado ni ejecutado con estos cambios.
- El código ya no incluye el formulario ni referencias de correo; `/cuenta` apunta directamente al dashboard. Falta comprobar el inicio anónimo desde navegador.

## Bloqueos y siguiente acción

1. Enviar una solicitud desde el formulario usando la sesión de dueño y verificar que aparece en `appointment_requests`; después recargar la página.
2. Publicar los cambios locales para que GitHub Pages incorpore el flujo de guardado y las variables configuradas.
3. Las solicitudes no reservan horario ni se muestran al veterinario; ampliar esos permisos requiere una decisión de producto.
4. Revisar por separado el warning sobre `public.rls_auto_enable()` antes de alterar su ACL.

**No repetir recursos al retomar:** CLI ya autenticada, proyecto existente enlazado, `.env.local` configurado y ambas migraciones aplicadas. No volver a subirlas; usa una migración nueva para cambios futuros.
