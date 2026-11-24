# Integración Supabase — POWSI

**Fecha de revisión:** 24 de noviembre de 2026
**Fuente indicada:** `docs/ER-CRUD.pdf` (conservado en el workspace; no incluido en la publicación del sitio)
**Estado:** migración y RLS aplicados/verificados; CRUD probado con sesiones Auth. El espacio de mascotas abre directamente con sesión anónima en segundo plano, sin pantalla/campo de correo. La sesión queda ligada al navegador.

## Alcance y fuentes

Se extrajo el texto de las tres páginas del PDF y se revisó el HTML fuente local `docs/ER-CRUD.html`. Estos archivos de análisis se conservan en el workspace y no se publican con el sitio. El documento es un informe de preparación técnica, no una especificación ER/CRUD completa:

- Página 1: describe como modelo de referencia la cuenta del dueño, el perfil de mascota, un veterinario asignado opcional y notas asociadas al perfil.
- Páginas 2–3: documentan preparación del SDK, pruebas de configuración y tareas futuras; no definen una matriz CRUD por rol, tipos SQL, nulabilidad, restricciones, borrados ni una especificación de citas.
- El PDF recalca que la autorización del veterinario y las operaciones sobre notas requieren decisiones adicionales. No se toma una propuesta como permiso aprobado.

La inspección del HTML fuente no encontró un diagrama ER ni una tabla CRUD; la tabla de la página 2 enumera pruebas de configuración. Solo aparecen imágenes de marca. Se intentó rasterizar el PDF con PDF.js, pero el adaptador temporal de canvas falló; por eso no se generaron imágenes ni se afirma una revisión visual de la maquetación. Esa limitación no cambia la conclusión de que la fuente disponible no define el esquema/CRUD requerido.

El repositorio también contiene [`docs/analisis-entidad-crud-seguridad.md`](../analisis-entidad-crud-seguridad.md), con un modelo conceptual complementario. Ese documento identifica como **propuestas** las relaciones y permisos; no convierte sus decisiones en requisitos aprobados.

Por solicitud expresa de la usuaria, se añadió además persistencia para las solicitudes de cita que ya recogía el formulario. Esta entidad y sus permisos son una extensión de la aplicación, no requisitos definidos por el PDF.

## Modelo disponible y límites

| Entidad candidata | Atributos visibles en el análisis complementario | Relaciones descritas | Lo que no define la fuente |
|---|---|---|---|
| Cuenta del dueño | `id`, `nombre` | Un dueño tiene `0..N` perfiles; cada perfil pertenece a un dueño. | Identidad, tipo SQL, creación, edición o borrado. |
| Cuenta veterinaria | `id`, `nombre` | Un veterinario puede relacionarse con `0..N` perfiles; cada perfil tiene `0..1` veterinario asignado. | Quién crea/asigna cuentas, qué datos pueden leer los dueños y qué CRUD tiene el veterinario. |
| Perfil de mascota | `id`, `dueno_id`, `veterinario_id` opcional, `nombre`, `especie` | Pertenece a un dueño, opcionalmente a un veterinario, y tiene `0..N` notas. | Tipos, obligatoriedad exacta, campos adicionales y regla de borrado. |
| Nota | `id`, `perfil_id`, `texto` | Pertenece a un perfil; un perfil tiene `0..N` notas. | Autoría, auditoría, retención y permisos CRUD por rol. |

Los tipos `int` y `string` del diagrama complementario son ilustrativos, no tipos PostgreSQL acordados. La aplicación además maneja `age`, `weight`, `breed` e `image` en el perfil; son campos existentes de UI, no atributos enumerados por el PDF. Su representación y restricciones deben confirmarse al cerrar el esquema.

### Matriz CRUD y correspondencia actual

| Entidad/flujo | Crear | Leer | Actualizar | Eliminar | Estado |
|---|---|---|---|---|---|
| Cuenta del dueño | `src/context/AuthContext.jsx` crea sesión anónima con `account_type=owner`; el trigger crea el perfil. El trigger se probó con cuenta temporal; falta probar el recorrido anónimo desde navegador. | Consulta propia en AuthContext; probada con sesión autenticada. | No hay flujo. | No hay flujo. | No se pide ni muestra correo; cada navegador sin sesión crea un propietario separado. |
| Cuenta veterinaria | No hay alta/provisión en la UI; la prueba la creó por operación administrativa. | AuthContext consulta la tabla; veterinario propio y directorio visible al dueño probados. | No hay flujo. | No hay flujo. | Lectura probada con Auth; provisión solo por operador confiable. |
| Perfil de mascota | `addPet` en `src/hooks/usePetProfiles.js`; se probó con sesión de dueño. | `loadPets`; se probó propio, denegado sin asignación y visible al veterinario asignado. | `updatePet`; se probó con dueño. | `removePet`; se probó con dueño. | API Supabase verificada; formulario React no se automatizó en navegador. |
| Nota | `createNote`; dueño y veterinario asignado probados. | `loadPets`; dueño y veterinario asignado probados; no asignado denegado. | `updateNote`; dueño y veterinario asignado probados. | `removeNote`; dueño permitido y veterinario denegado, probado. | API Supabase verificada con sesiones Auth reales. |
| Solicitud de cita | `src/pages/AppointmentPage.jsx` inserta la solicitud en `public.appointment_requests` con el dueño de la sesión, la mascota (si existe), su nombre, servicio, fecha, hora, contacto y notas. | La política y el permiso `SELECT` permiten al dueño consultar sus propias solicitudes; la UI aún no incluye una pantalla de historial. | No implementado. | No implementado. | Extensión solicitada por la usuaria, no especificada en el PDF. Guardar una solicitud no reserva ni confirma disponibilidad. |
| Historial, vacunas y tratamientos | No hay operaciones; son contenido ilustrativo en `src/pages/PetDashboardPage.jsx`. | Datos estáticos. | No implementado. | No implementado. | Fuera del modelo fuente disponible. |

La matriz de permisos no está especificada en el PDF. El usuario aprobó la matriz aplicada a perfiles y notas: `anon` no puede consultar las tablas; el dueño administra sus perfiles/notas y el veterinario asignado tiene los permisos descritos en la migración. Para citas se añadió una política separada de mínimo privilegio: el dueño autenticado solo puede crear y leer sus propias solicitudes; no se concedió acceso a `anon`, veterinarios, ni permisos de edición/cancelación. Guardar una solicitud no confirma una reserva. El inicio anónimo crea un usuario Auth con rol `authenticated`, sujeto a las políticas por `auth.uid()`.

## Estado técnico verificado

- Stack: React 19, Vite, JavaScript/JSX; `@supabase/supabase-js` v2 y Supabase CLI v3.1.0 están instalados en el proyecto.
- CLI autenticada; una sola organización retornada: `caminazz-solano's Powsi`.
- Proyecto remoto existente identificado y enlazado: `caminazz-solano's Project`, región `us-west-2`, ref `rofpcefkccfwccwfncbj`. No se creó un proyecto duplicado.
- `.env.local` contiene la URL del proyecto y su clave `sb_publishable_`; el archivo está excluido por `.gitignore`. No se guardó una clave secreta ni `service_role`.
- `20261118161000_powsi_profiles_and_notes.sql` y `20261124013000_create_appointment_requests.sql` están aplicadas al proyecto remoto; el historial local/remoto coincide.
- Consultas de solo lectura confirmaron las cuatro tablas de perfiles y la tabla `appointment_requests`. RLS está habilitado; la tabla de citas tiene políticas propias de lectura/inserción. `supabase db lint --remote --schema public` no encontró errores.
- Consultas anónimas a cada tabla se denegaron con `42501`.
- Se crearon temporalmente cuentas confirmadas de dueño/veterinario y datos ficticios para pruebas con SDK Auth normal; no se enviaron correos. Las pruebas CRUD/RLS pasaron y el bloque `finally` eliminó cuentas y filas.
- Consulta posterior confirmó cero filas en las cuatro tablas y cero usuarios de prueba `powsi-%@example.invalid`.
- Se habilitó `auth.enable_anonymous_sign_ins` de forma remota. `supabase config diff --remote` quedó sin diferencias tras aplicar el ajuste.
- Se retiró de Supabase la URL de retorno local añadida para el flujo por correo; no se cambiaron `Site URL`, proveedores de correo ni plantillas.
- El código ya no contiene la pantalla/campos de correo; `/cuenta` abre el dashboard de mascotas. La creación real de la primera sesión anónima en navegador aún debe verificarse.

## Migración aplicada y permisos

`supabase/migrations/20261118161000_powsi_profiles_and_notes.sql` crea `owner_accounts`, `veterinarian_accounts`, `pet_profiles` y `pet_notes`, añade tipos/restricciones e índices, un trigger de alta de dueño, RLS y grants. Esas decisiones técnicas no están todas en la fuente; el usuario aprobó explícitamente esta migración y su matriz concreta antes del despliegue.

En particular, la migración permite a los dueños consultar el directorio de veterinarios y cambiar `veterinarian_id`; permite a veterinarios asignados crear y actualizar notas, pero no borrarlas. El PDF no define esos permisos, reglas `ON DELETE` ni límites numéricos. Son decisiones aprobadas para esta versión; los cambios futuros deben usar una nueva migración, no editar la migración aplicada.

`supabase/migrations/20261124013000_create_appointment_requests.sql` añade `appointment_requests`, con referencia opcional a un perfil existente, nombre de mascota conservado como texto, servicio, fecha, hora, teléfono opcional, notas y fecha de creación. RLS concede únicamente `SELECT` e `INSERT` a `authenticated`, con políticas que restringen ambas operaciones al dueño autenticado; el `INSERT` valida que el perfil asociado, si se indicó, pertenezca a ese dueño. No se implementaron lectura para veterinarios, edición, cancelación, disponibilidad ni confirmación de reserva porque no forman parte de lo solicitado ni están definidos por el PDF.

No hay semillas. `supabase/config.toml` conserva ajustes locales de desarrollo; no se ha enviado con `supabase config push` ni se debe asumir que sus opciones de Auth están activas en Cloud.

## Verificaciones ejecutadas

- `supabase orgs list`, `supabase projects list` y `supabase link --project-ref rofpcefkccfwccwfncbj`: proyecto existente identificado y enlace local completado.
- `supabase db push --dry-run --remote`: antes de aplicar, confirmó el único archivo pendiente.
- `supabase db push --remote --yes` y `supabase migration list --remote`: ambas migraciones aplicadas y timestamps iguales en local/remoto.
- `supabase db query --remote --read-only`: verificó columnas de `appointment_requests`, RLS activo, sus dos políticas, privilegios efectivos `SELECT`/`INSERT` para `authenticated` y ausencia de `SELECT`/`INSERT` para `anon`.
- `supabase db lint --remote --schema public`: sin errores tras aplicar la tabla de citas.
- Con una sesión anónima Auth y la clave publicable, se creó y volvió a leer una solicitud ficticia mediante la API; `owner_accounts` y la política del dueño se aplicaron correctamente. La fila y la cuenta temporales se borraron después y una consulta confirmó cero residuos.
- Consulta de `pet_profiles`, `pet_notes`, `owner_accounts` y `veterinarian_accounts` con clave publicable anónima: todas denegadas con `42501`.
- `supabase db advisors --remote --type security --level warn`: emitió avisos para `public.rls_auto_enable()`. El catálogo confirma que es una función `SECURITY DEFINER` enlazada al event trigger `ensure_rls`; no pertenece a la migración de la aplicación y no se modificaron sus permisos.
- `npm run build`: correcto con la configuración local.
- `npm run test:supabase-key`: 2 pruebas aprobadas.
- La inserción desde la interfaz de citas compila y la API Auth/PostgREST ya probó insertar/leer con RLS. Aún no se ha enviado el formulario React desde el navegador; ese recorrido visual extremo a extremo queda pendiente.

Las pruebas con clientes `supabase-js` y sesiones Auth verificaron persistencia y permisos de dueño/veterinario, incluida revocación en caliente. Falta validar en navegador la creación/restauración de una sesión anónima y la persistencia tras recargar.

## Decisiones necesarias para continuar

1. Probar en navegador que se crea/restaura una sesión anónima, se crea el perfil de dueño y se conservan los datos al recargar. Los datos no se recuperan desde otro dispositivo ni después de borrar datos locales.
2. La solicitud de cita ya se persiste en `appointment_requests` con permisos de dueño. La petición no reserva el horario ni confirma la cita; un historial, acceso de personal, edición y cancelación necesitarían requisitos y políticas adicionales.
3. Revisar por separado los avisos del advisor sobre `public.rls_auto_enable()` antes de alterar su ACL.

**Siguiente acción para retomar:** probar el envío de una cita desde la aplicación con una sesión de dueño y verificar su fila; luego publicar los cambios del workflow de GitHub Pages.
