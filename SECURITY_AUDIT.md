# Job Tracker Security Audit

Date: 2026-08-04
Scope: local frontend in this repository and black-box checks against `http://localhost:3000`.

## Executive Summary

The application has a solid baseline for authentication on protected interview and profile endpoints. Public admin self-registration is blocked, candidate role escalation for creating jobs/interviews is blocked, and login rate limiting is now observable.

The highest priority remaining issue is authorization behavior for `GET /api/applications` with a candidate token. The endpoint returned `200`; if it is not strictly scoped to the authenticated candidate, it can expose application data.

## Findings

### High - Candidate Can Access `GET /api/applications`

Evidence: a user registered with role `candidate` received `HTTP 200` from `GET /api/applications`.

Impact: candidates may be able to enumerate applications or see other candidate/job relationship data if the endpoint is not scoped server-side.

Recommendation: return `403` for candidate users on the general endpoint, or make the endpoint return only the authenticated candidate's own applications. Prefer a dedicated route such as `GET /api/applications/me`.

### High - CORS Needs Strict Production Review

Evidence: earlier testing showed permissive CORS behavior with untrusted origins. A later preflight returned `500`, which still requires investigation because preflights should fail cleanly and predictably.

Impact: permissive or unstable CORS can expose authenticated API behavior to malicious origins, especially if cookies or credentials are later introduced.

Recommendation: use a strict allowlist for development and production origins. Do not reflect arbitrary origins. Avoid `Access-Control-Allow-Credentials: true` unless required and paired with a strict origin allowlist.

### Medium - Security Headers Missing

Evidence: `/health` did not include these headers:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `X-Frame-Options`

Impact: missing browser security headers increases exposure to clickjacking, MIME sniffing, data leakage through referrers, and XSS blast radius.

Recommendation: add these headers at the API/proxy layer. For production, set HSTS only over HTTPS.

### Medium - HTML-Like Payloads Accepted in Job and Candidate Fields

Evidence: authenticated recruiter requests accepted `<img src=x onerror=alert("audit-xss")>` in job and candidate fields with `HTTP 201`.

Impact: the current React frontend escapes text by default, but stored payloads could execute in another client, admin tool, email template, PDF export, or future frontend if rendered unsafely.

Recommendation: enforce plain-text validation server-side for names, titles, company, location, and descriptions. Encode output in all non-React render targets.

### Medium - JWT Stored in `localStorage`

Evidence: the frontend stores the bearer token under `localStorage` key `token`.

Impact: if any XSS is introduced, the token can be read and reused.

Recommendation: for production, prefer `HttpOnly`, `Secure`, `SameSite` cookies. If bearer tokens remain, harden CSP, reduce token lifetime, and implement refresh-token rotation.

### Medium - CV Data Stored Locally as Data URL

Evidence: selected CVs are saved in `localStorage` under `jobtracker-resume:*`.

Impact: CVs may contain personal data. Storing them in browser storage increases exposure on shared devices and through XSS.

Recommendation: implement a backend CV upload endpoint with authenticated access controls. Store only file metadata in the frontend and fetch documents on demand with authorization.

## Positive Controls Observed

- `GET /api/auth/me` without token returned `401`.
- `GET /api/interviews` without token returned `401`.
- `GET /api/interviews/:id/join` without token returned `401`.
- Invalid JWTs were rejected.
- Public `role: "admin"` registration returned `403`.
- Candidate `POST /api/jobs` returned `403`.
- Candidate `POST /api/interviews` returned `403`.
- Avatar `sourcePath` local file traversal probe returned `400`.
- Login rate limiting returned `429` after repeated failures.
- Frontend CV viewer now restricts document URLs and uses an iframe sandbox.

## Recommended Next Steps

1. Fix candidate access to `/api/applications`.
2. Lock down CORS with an explicit allowlist.
3. Add production security headers.
4. Move CV handling to authenticated backend storage.
5. Add backend validation for all user-controlled text fields.
6. Move auth from `localStorage` to secure cookies before production.
