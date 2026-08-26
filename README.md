<h1 align="center">JobTracker</h1>

<p align="center">
  An applicant tracking system for small recruiting teams: jobs, candidates,
  applications, pipelines, and interviews in one workspace.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Status" src="https://img.shields.io/badge/status-active-brightgreen">
</p>

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="JobTracker dashboard" width="900">
</p>

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

JobTracker is a single-page React application for running a hiring process end
to end. Recruiters publish openings, review incoming applications, move
candidates through pipeline stages, schedule interviews, and join the call
without leaving the app. Candidates get a reduced view of the same workspace.

The repository contains the frontend only. It talks to a deployed REST API over
relative `/api` paths, so the same build works in local development and in
production.

## Features

| Area | What it does |
| --- | --- |
| Authentication | Email/password login and registration with role selection, protected routes, and role-based access control. |
| Dashboard | Hiring counters, latest applications, and upcoming interviews. |
| Jobs | Job list with company, location, salary, and open/closed state, plus a detail page per role. |
| Applications | A single reviewable queue of candidate/role submissions. |
| Candidates & talent pool | Candidate directory with attached CVs and a warm list for future roles. |
| Pipeline | Stage counters from sourcing through offer. |
| Interviews | Scheduling for video, phone, and onsite interviews, with an in-app meeting room. |
| Reports | Role coverage, candidate volume, application flow, and interview status. |
| Settings | Notification preferences, default pipeline stage, and weekly application goal. |

## Screenshots

### Sign in

Recruiters and candidates share one entry point. Registering lets you pick a
role, and candidates can attach a CV during sign-up.

<img src="docs/screenshots/login.png" alt="Sign in" width="900">

### Jobs

<img src="docs/screenshots/jobs.png" alt="Jobs" width="900">

### Job details

<img src="docs/screenshots/job-details.png" alt="Job details" width="900">

### Applications

<img src="docs/screenshots/applications.png" alt="Applications" width="900">

### Pipeline

<img src="docs/screenshots/pipelines.png" alt="Pipeline" width="900">

### Interviews

<img src="docs/screenshots/interviews.png" alt="Interviews" width="900">

### Reports

<img src="docs/screenshots/reports.png" alt="Reports" width="900">

### Settings

<img src="docs/screenshots/settings.png" alt="Settings" width="900">

## Architecture

- **React 19 + Vite 8** single-page app, routed with **React Router 7**.
- **Tailwind CSS 4** for layout and theming, **Material UI** and **MUI X
  Charts** for richer widgets, **Lucide** for icons.
- Every page is code-split with `React.lazy`, so a route is only downloaded
  when it is first visited.
- Auth state lives in `AuthContext`. The access token is kept in memory (never
  in `localStorage`) and requests are sent with `credentials: "include"` so the
  API's session cookie also works.
- All network access goes through `apiRequest()` in `src/utils/api.js`, which
  attaches the token, normalizes `{ success, data }` envelopes, and raises
  errors carrying the HTTP status. The same module holds the API-to-UI mappers
  (`mapJobFromApi`, `mapCandidateFromApi`, `mapInterviewFromApi`, ...).
- The API base URL is the relative path `/api`. Requests are proxied to the
  backend by Vite in development and by Netlify redirects in production, which
  keeps the browser same-origin and avoids CORS entirely.

The backend is deployed separately at:

```txt
https://cutlet-infinite-cow.abasthan.app/
```

## Getting started

### Requirements

- Node.js
- pnpm

### Installation

```bash
git clone https://github.com/Fran-web-dev/jobTracker.git
cd jobTracker
pnpm install
```

### Run the app

```bash
pnpm dev
```

The dev server prints a local URL, usually <http://localhost:5173>. Requests to
`/api`, `/health`, and `/uploads` are proxied to the deployed backend by
`vite.config.js`, so no local API is required.

## Usage

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server. |
| `pnpm build` | Create a production build in `dist/`. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm lint` | Run ESLint across the project. |

## Project structure

```txt
src/
  components/   Reusable UI components (sidebar, navbar, cards, route guard)
  context/      Authentication context and hook
  Hooks/        Data-fetching hooks (useApiResource, useFetch)
  pages/        One module per route
  utils/        API client, mappers, and helpers
docs/
  screenshots/  Images used in this README
```

## Routes

| Route | Page | Access |
| --- | --- | --- |
| `/login` | Sign in / register | Public |
| `/` | Dashboard | Authenticated |
| `/jobs`, `/jobs/:id` | Jobs and job details | Authenticated |
| `/calendar` | Calendar | Authenticated |
| `/interviews` | Interviews | Authenticated |
| `/call/:meetingId` | Meeting room | Authenticated |
| `/resume-viewer` | CV viewer | Authenticated |
| `/settings` | Settings | Authenticated |
| `/applications` | Applications | `recruiter`, `admin` |
| `/candidates` | Candidates | `recruiter`, `admin` |
| `/companies` | Companies | `recruiter`, `admin` |
| `/pipelines` | Pipeline | `recruiter`, `admin` |
| `/reports` | Reports | `recruiter`, `admin` |
| `/talent` | Talent pool | `recruiter`, `admin` |

## Deployment

```bash
pnpm build
```

The build output is written to `dist/`. `netlify.toml` configures the Netlify
deploy: it forwards `/api/*`, `/health`, and `/uploads/*` to the backend and
serves `index.html` for every other path so client-side routing works on
refresh.

## Security

CV rendering is restricted to documents served from the API's `/uploads/`
path (`isSafeDocumentUrl`), and access tokens are never persisted to browser
storage. `SECURITY_AUDIT.md` and `RED_TEAM_REPORT.md` record the findings and
remaining hardening work from an assessment of the platform.

## Contributing

Issues and pull requests are welcome. Please run `pnpm lint` before opening a
pull request, and keep changes focused on a single concern.

## License

No license has been declared for this project yet, so all rights are reserved
by the author.
