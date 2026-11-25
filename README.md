# AMAC - Bolsa de trabajo

Proyecto final (Entrega 3) de Desarrollo de Aplicaciones Web. Es la bolsa de trabajo de AMAC para personas adultas mayores, ahora hecha en React, con Supabase como base de datos y publicada en Vercel.

- Sitio: https://amac-react-ten.vercel.app/
- Repositorio: https://github.com/carlosaguilars05/amac-react
- Video: https://drive.google.com/file/d/1GoxQbl-DdqklELhnXzoaPTTpxVFhjhPc/view?usp=sharing
- Diapositivas: Adjuntas en la entrega de Blackboard (`AMAC_Presentacion_Final.pptx`)

## Integrantes

- **Amaury Pérez:** configuración del proyecto con Vite y Vercel, los estilos de la Entrega 2 y los componentes Boton, Encabezado, Pie, EtiquetaEstatus y MensajeEstado.
- **Juan Collado:** conexión con Supabase, AuthContext, RutaProtegida, TarjetaVacante y las páginas del candidato (login, registro, detalle de vacante, mis solicitudes, favoritos y perfil).
- **Carlos Aguilar:** base de datos y políticas RLS, rutas en App.jsx, listado con búsqueda y filtros, las páginas de la empresa y el panel de admin.

## Tecnologías

React con Vite, React Router, Supabase (Auth, PostgreSQL y RLS) y Vercel.

## Cómo correrlo

```bash
npm install
```

Crear un archivo `.env.local` en la raíz con los datos del proyecto de Supabase (ver `.env.example`):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

```bash
npm run dev
```

## Cuentas de prueba

Todas usan la contraseña `Amac2026!`

| Tipo | Correo |
|---|---|
| Candidato aprobado | candidato.aprobado@amac-demo.com |
| Candidato sin aprobar | candidato.pendiente@amac-demo.com |
| Empresa | empresa@amac-demo.com |
| Admin (extra) | admin@amac-demo.com |

## Base de datos

El SQL que usamos está en [supabase/esquema.sql](supabase/esquema.sql).

![Diagrama de la base de datos](img/esquema-bd.png)

### Políticas RLS

Todas las tablas tienen RLS activado.

**perfiles**
- Cada quien ve su propio perfil.
- Todos pueden ver los perfiles de empresas (para mostrar su nombre en las vacantes).
- Una empresa puede ver el perfil de quien se postuló a sus vacantes.
- El admin ve todos los perfiles.
- Cada quien edita su perfil, pero nadie puede cambiarse el rol ni aprobarse solo.

**vacantes**
- Todos ven las vacantes activas y cada empresa ve todas las suyas.
- El candidato sigue viendo las vacantes a las que se postuló aunque se pausen.
- El admin ve todas las vacantes.
- Solo una empresa puede publicar, y solo a su nombre.
- Cada empresa solo edita sus vacantes.

**solicitudes**
- El candidato ve sus solicitudes y la empresa ve las de sus vacantes.
- Solo un candidato aprobado puede postularse. El `unique (vacante_id, candidato_id)` evita que se postule dos veces.
- El candidato puede cancelar solo si la solicitud está en "Enviada" o "En revisión".
- La empresa puede cambiar el estatus a "En revisión", "Aceptada" o "Rechazada".

**favoritos**
- Cada candidato ve, guarda y borra solo sus favoritos.

## Requerimientos

| # | RF | Funcionalidad | Estado |
|---|---|---|---|
| 1 | RF-001 | Listado de vacantes activas | ✅ Completo |
| 2 | RF-002, RF-007 | Búsqueda y filtros por horario y categoría | ✅ Completo |
| 3 | RF-003, RF-051 | Detalle de vacante con botón Llamar | ✅ Completo |
| 4 | RF-011, RF-012, RF-013 | Registro de candidato | ✅ Completo |
| 5 | RF-008, RF-009 | Inicio y cierre de sesión | ✅ Completo |
| 6 | RF-004, RF-054 | Postularme | ✅ Completo |
| 7 | RF-005, RF-006 | Mis solicitudes y cancelar | ✅ Completo |
| 8 | RF-015 | Registro de empresa | ✅ Completo |
| 9 | RF-019 | Publicar y editar vacante | ✅ Completo |
| 10 | RF-020, RF-021 | Mis vacantes (pausar, reactivar, cerrar) | ✅ Completo |
| 11 | RF-022, RF-024 | Solicitudes recibidas y cambio de estatus | ✅ Completo |
| 12 | RF-010 | Rutas protegidas por rol | ✅ Completo |

Extras:

| RF | Funcionalidad | Estado |
|---|---|---|
| RF-054 | Panel de admin para aprobar candidatos | ✅ Completo |
| RF-014, RF-017 | Editar perfil | ✅ Completo |
| RF-041 | Vacantes favoritas | ✅ Completo |
| RF-024 | Fecha de cambio de estatus | ✅ Completo |
| RF-016 | Logo de empresa con Storage | ❌ Pendiente |
| RF-029 | Recuperar contraseña | ❌ Pendiente |
| RF-055 | Proceso de selección por etapas | ❌ Pendiente |
