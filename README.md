# JobTracker

JobTracker es una aplicacion web para gestionar procesos de reclutamiento. Permite dar seguimiento a vacantes, candidatos, postulaciones, entrevistas, pipeline de seleccion y reportes desde una interfaz moderna construida con React.

## Caracteristicas

- Autenticacion de usuarios y rutas protegidas.
- Dashboard general del proceso de contratacion.
- Gestion de vacantes y detalle de cada puesto.
- Gestion de candidatos, empresas y postulaciones.
- Pipeline de seleccion para organizar el avance de candidatos.
- Calendario y modulo de entrevistas.
- Sala de reunion para entrevistas.
- Visor de resumes/CV.
- Reportes y configuracion de usuario.

## Tecnologias

- React 19
- Vite 8
- React Router
- TanStack React Query
- Material UI
- Lucide React
- Tailwind CSS
- ESLint

## Backend

El frontend consume la API desplegada en:

```txt
https://cutlet-infinite-cow.abasthan.app/
```

La base de la API esta configurada en `src/utils/api.js`:

```txt
https://cutlet-infinite-cow.abasthan.app/api
```

## Requisitos

- Node.js
- npm

## Instalacion

Clona el repositorio e instala las dependencias:

```bash
npm install
```

## Desarrollo

Ejecuta el servidor local de Vite:

```bash
npm run dev
```

Luego abre la URL que muestre la terminal, normalmente:

```txt
http://localhost:5173
```

## Scripts

```bash
npm run dev
```

Inicia el servidor de desarrollo.

```bash
npm run build
```

Genera la version de produccion en `dist/`.

```bash
npm run preview
```

Sirve localmente el build de produccion.

```bash
npm run lint
```

Ejecuta ESLint sobre el proyecto.

## Estructura principal

```txt
src/
  components/   Componentes reutilizables
  context/      Contexto de autenticacion
  Hooks/        Hooks personalizados
  pages/        Vistas principales de la aplicacion
  utils/        Cliente y helpers de API
```

## Rutas principales

- `/login` - Inicio de sesion.
- `/` - Dashboard.
- `/jobs` - Vacantes.
- `/jobs/:id` - Detalle de vacante.
- `/applications` - Postulaciones.
- `/candidates` - Candidatos.
- `/companies` - Empresas.
- `/pipelines` - Pipeline de seleccion.
- `/calendar` - Calendario.
- `/interviews` - Entrevistas.
- `/call/:meetingId` - Sala de reunion.
- `/resume-viewer` - Visor de CV.
- `/reports` - Reportes.
- `/settings` - Configuracion.
- `/talent` - Talent pool.

## Build

Para generar una version lista para despliegue:

```bash
npm run build
```

Los archivos finales se generan en:

```txt
dist/
```
