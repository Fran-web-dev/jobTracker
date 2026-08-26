# OPERATION JOBTRACKER

Red Team Security Assessment  
Date: 2026-08-04  
Target: Job Tracker ATS Platform  
Environment: Local API at `http://localhost:3000` and React frontend  
Rules of Engagement: Non-destructive validation only

## Executive Brief

Job Tracker resisted the obvious entry points: anonymous access to protected routes failed, invalid tokens were rejected, public admin registration was blocked, and candidate role escalation into job/interview creation was denied.

The operation did reveal several enterprise-grade hardening gaps. The main issue is authorization ambiguity around `GET /api/applications` for candidate users. It returned `200`, which is acceptable only if the response is strictly scoped to the authenticated candidate. If it ever returns global application data, that becomes a high-impact privacy and hiring-process exposure.

The platform is not "open", but it is not yet production-hardened.

## Mission Scope

In scope:

- Authentication and session behavior
- Role-based authorization
- Candidate/recruiter privilege separation
- CORS behavior
- Upload-adjacent controls
- CV rendering controls
- Security headers
- Login rate limiting
- Stored-input handling

Out of scope:

- Destructive DoS
- Data deletion
- Credential theft
- Persistence
- Real exploitation against third-party infrastructure

## Attack Narrative

### Phase 1 - Recon

The target exposes a React frontend backed by a JSON API. The frontend uses bearer tokens and sends them through the `Authorization` header. Sensitive workflows include authentication, candidates, applications, interviews, meeting join links, avatar upload, and CV viewing.

Primary assets:

- User token
- Candidate profile data
- CV documents
- Job/application data
- Interview room URLs

### Phase 2 - Anonymous Access Checks

Protected endpoints rejected unauthenticated access:

| Endpoint | Result |
| --- | --- |
| `GET /api/auth/me` | `401` |
| `GET /api/interviews` | `401` |
| `GET /api/interviews/:id/join` | `401` |
| `GET /api/candidates` | `401` |
| `GET /api/applications` | `401` |

Assessment: baseline authentication enforcement is working.

### Phase 3 - Token Integrity Checks

Invalid JWT-style tokens were rejected on protected routes.

Assessment: the API is not accepting malformed or fake bearer tokens in the tested paths.

### Phase 4 - Role Escalation Attempt

Public registration with `role: "admin"` returned `403`.

Candidate token behavior:

| Action | Result |
| --- | --- |
| View own profile | `200` |
| View jobs | `200` |
| View interviews | `200` |
| List all candidates | `403` |
| Create job | `403` |
| Create interview | `403` |
| List applications | `200` |

Assessment: most role boundaries held. `GET /api/applications` needs immediate review.

### Phase 5 - Input Payload Handling

HTML-like payloads were accepted in recruiter-controlled job/candidate fields and returned `201`.

Current frontend rendering is React-based, so ordinary text interpolation is escaped. The risk remains because stored payloads may later flow into another client, an email template, a server-rendered page, PDF generation, logs, or an admin integration.

Assessment: stored-input validation is incomplete.

### Phase 6 - Upload Surface

Avatar source path traversal probe returned `400`.

Assessment: the tested local file import path did not accept traversal/local system file import. Keep this server-side restriction.

### Phase 7 - Rate Limit Pressure

Repeated login failures eventually returned `429`.

Assessment: login rate limiting is present. It should be tuned and monitored in production.

## Findings

### F-01 High - Candidate Access to `GET /api/applications`

Evidence: candidate token received `HTTP 200`.

Business impact: application records can include candidate identity, job relationships, status, and hiring workflow data. If the endpoint returns global application data, candidates could infer other applicants or internal hiring activity.

Required fix:

- Return `403` for candidates on the general endpoint, or
- Scope the response to the authenticated candidate only, and
- Prefer `GET /api/applications/me` for candidate-facing data.

Verification:

- Candidate token should not receive other users' applications.
- Recruiter/admin should still receive the full authorized list.

### F-02 High - CORS Policy Requires Production Hardening

Evidence: testing showed unstable/untrusted-origin behavior during preflight checks.

Business impact: overly permissive CORS can allow malicious websites to interact with authenticated browser sessions, especially if cookies are adopted later.

Required fix:

- Allow only approved origins.
- Do not reflect arbitrary origins.
- Avoid `Access-Control-Allow-Credentials: true` unless required.
- Make rejected preflights return a clean `403` or no CORS headers, not `500`.

### F-03 Medium - Missing Browser Security Headers

Missing headers:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `X-Frame-Options`

Business impact: larger blast radius for XSS, clickjacking, MIME sniffing, and referrer leakage.

Required fix:

- Add headers at the API/proxy layer.
- For the frontend, add a CSP compatible with React/Vite build output.

### F-04 Medium - Stored HTML-Like Payloads Accepted

Evidence: job and candidate fields accepted HTML-like strings.

Business impact: future clients or integrations may render stored data unsafely.

Required fix:

- Validate text fields server-side.
- Normalize or reject HTML tags in plain-text fields.
- Encode output in emails, PDFs, logs, and server-rendered views.

### F-05 Medium - Bearer Token Stored in `localStorage`

Evidence: frontend stores token in `localStorage`.

Business impact: any future XSS can steal the token.

Required fix:

- Prefer `HttpOnly`, `Secure`, `SameSite` cookies.
- Shorten access-token lifetime.
- Add refresh-token rotation if using sessions.
- Add CSP to reduce XSS impact.

### F-06 Medium - CV Data Stored in Browser Storage

Evidence: CV preview data is stored under `jobtracker-resume:*`.

Business impact: CVs contain personal data and may remain on shared devices.

Required fix:

- Add authenticated backend CV upload.
- Store files server-side or in object storage.
- Store only metadata in the browser.
- Enforce access control per candidate/recruiter relationship.

## Defensive Kill Chain

1. Initial access blocked by token checks.
2. Public admin escalation blocked.
3. Candidate lateral movement mostly blocked.
4. Application listing remains the main authorization question.
5. Stored-input payloads are accepted but not exploitable in the current React rendering path.
6. CV and token storage increase impact if XSS is introduced later.

## Priority Remediation Plan

### 24 Hours

- Fix or confirm strict scoping for `GET /api/applications`.
- Lock down CORS allowlist.
- Ensure rejected CORS preflights do not return `500`.

### 72 Hours

- Add security headers.
- Add server-side validation for jobs/candidates/applications/interviews.
- Document role permissions per endpoint.

### 2 Weeks

- Move JWT from `localStorage` to secure cookies.
- Build authenticated CV upload/storage.
- Add automated authorization tests for candidate/recruiter/admin.

## Final Assessment

Risk rating: Medium-High before remediation.

The platform is close to a secure MVP, but production readiness depends on fixing authorization scoping, CORS, headers, and sensitive document storage. The current controls show good intent; the next step is making them explicit, testable, and enforced server-side.
