# Software Design Document

IEEE Zewail City Student Branch Web Platform. Explains how the requirements in `SRS.md` will be built.

## 1. Design goals
| Goal | Design response |
|---|---|
| Maintainable by juniors, yearly turnover | Few moving parts, feature folders, small PRs, written rules |
| Safe by default | One auth scheme, server-side permission checks, validation at the boundary, parameterized queries |
| Content editable without a developer | Content is data in the database, edited through the admin panel |
| Shippable in phases | Public site and admin first; internal system last |

## 2. Architecture

```
            Browser
   ┌───────────┴────────────┐
   │                        │
 apps/web                apps/internal
 Next.js                 Vite + React
 public site             admin + work areas
 (SEO, server-rendered)  (logged-in only)
   │                        │
   └───────────┬────────────┘
               │  HTTP + session cookie
            apps/api
            Express
        routes → services → db
               │
           PostgreSQL
```

- **apps/web:** public pages. Reads data from the API. Needs search-engine visibility (FR-06), so it uses Next.
- **apps/internal:** one React app for everything behind login. The admin panel, the committee workspaces and the chairman overview are route areas inside it, not separate apps. No SEO need, so no Next.
- **apps/api:** the only thing that talks to the database.
- **packages/shared:** Zod schemas and types shared by all three apps, so request shapes cannot drift apart.

### 2.1 Technology
| Part | Choice | Note |
|---|---|---|
| Monorepo | npm workspaces | |
| Public site | Next.js, React, TypeScript | |
| Internal app | Vite, React, TypeScript | |
| API | Express 5, TypeScript | |
| Database | PostgreSQL 17 | |
| Data access | Drizzle ORM | Migrations are generated, committed and applied with `migrate`. `push` is for throwaway local databases only |
| Validation | Zod | In `packages/shared` |
| Local services | Docker Compose (Postgres only) | |
| Deployment | Docker, university servers | Pending IT answers |

## 3. Repository layout
```
apps/
  web/        Next.js public site
  internal/   Vite React app
  api/        Express API
packages/
  shared/     Zod schemas, types
docs/         SRS, design, decisions
```

API code is organized by feature, not by layer:
```
apps/api/src/
  routes.ts
  modules/
    events/     events.routes.ts, events.service.ts
    auth/
    ...
  middleware/
  db/
```

## 4. API layering rules
1. **Routes handle HTTP only.** Parse and validate input, call a service, return the result.
2. **Services hold business logic and permission checks.**
3. **Only services touch the database.**
4. **All input is validated** with a Zod schema from `packages/shared`.
5. Errors use one response shape and a stable error code. Services throw AppError(status, code, message) and one handler formats it.
6. Services throw `AppError(status, code, message)`. One handler formats it.

## 5. Authentication and authorization (decided once)

**Authentication**
- Individual accounts. Passwords hashed with argon2id.
- Sessions stored in Postgres. The browser holds a random session ID in an `httpOnly`, `secure`, `sameSite=lax` cookie with an expiry. Logging out deletes the session row.
- All apps run under one parent domain (or one reverse proxy) so the same cookie works. No JWTs in localStorage.
- State-changing requests are protected against CSRF.
- Login is rate limited.

**Authorization**
```
roles            id, name
permissions      id, key                        e.g. content.publish, tasks.assign
role_permissions role_id, permission_id
user_roles       user_id, role_id, scope_type, scope_id
```
- `scope_type` is `global`, `committee`, `project` or `event`.
- One function, `can(user, permission, scope)`, is the only place that decides access. Every protected API handler calls it.
- The UI hides things using the same rule, but that is only a convenience.
- The content committee gets `content.*` permissions as data. If a later board gives this to another committee, only rows change.
- Never write `if (committee === "content")`. Write `can(user, "content.publish")`.

## 6. Data model (main entities)

| Area | Entities |
|---|---|
| Identity | `users`, `sessions`, `roles`, `permissions`, `role_permissions`, `user_roles` |
| Organization | `people`, `terms`, `committees`, `board_memberships`, `committee_modules` |
| Events | `event_series`, `event_editions`, `event_media`, `registration_forms`, `registration_fields`, `registrations` |
| Courses | `courses`, `course_links` |
| Opportunities | `opportunities`, `opportunity_categories`, `majors`, `opportunity_majors`, `import_batches`, `import_rows` |
| Site content | `page_sections`, `announcements`, `history_milestones`, `media` |
| Audit | `audit_log` |
| Internal (later) | `projects`, `milestones`, `tasks`, `task_submissions`, `task_comments`, `notifications` |

Design notes:
- **`people` is separate from `users`.** Past board members appear in the history without needing a login.
- **Events:** a series has many editions. Editions are never overwritten.
- **Opportunity status** is calculated at query time from the deadline, with an `override` column.
- Content tables carry `created_by`, `updated_by` and timestamps.
- Links are validated as `http` or `https` only.

## 7. Key workflows

### 7.1 Publishing content
1. A content committee member signs in and edits an event in the admin panel.
2. The API checks `can(user, "content.publish")`, validates the input and saves it.
3. The API asks the public site to refresh its cached page for that content.
4. Visitors see the update.

### 7.2 Excel import
1. Admin downloads the template and uploads an `.xlsx` file.
2. The API checks size and type, parses it and validates every row.
3. Results are saved as an `import_batch` with per-row errors. Nothing is public yet.
4. The admin reviews the preview and confirms.
5. Valid rows are saved as drafts or published. The admin sees a summary.

### 7.3 Event registration
1. The admin defines form fields, a deadline and a capacity.
2. A visitor submits the form. The API checks the deadline and capacity in one transaction.
3. Registrants are visible only to users with `registrants.view` for that event.

## 8. Public routes and internal areas

**Public:** `/`, `/about`, `/events`, `/events/[series]/[year]`, `/courses`, `/opportunities`, `/opportunities/[id]`, `/contact`

**Internal (one app):**
```
/work                         my tasks
/work/:committeeSlug          committee workspace
/projects/...                 project creation and tracking
/overview                     chairman and vice chairman
/admin/content/...            events, courses, history, banners, opportunities
/admin/system/...             accounts, roles, settings
```
Navigation is built from the user's permissions. Committee slugs are labels stored in the database. Access never depends on a slug's name.

## 9. Security checklist
- Parameterized queries only. No SQL built from strings.
- Zod validation on every input.
- Server-side permission check on every protected endpoint.
- Uploads: allow-listed types, size limits, random file names, private files outside the public folder.
- Spreadsheet exports escape cells starting with `=`, `+`, `-`, `@`.
- Secrets in `.env` only, never in git.
- No stack traces or raw error text sent to clients.

## 10. Decisions
| Decision | Why |
|---|---|
| One internal app, not two | Same users, login and API. RBAC controls what each person sees |
| Drizzle over Prisma | No generate step in Docker builds |
| Roles as data | One person can hold several roles, and permissions must be configurable |
| Video by link, not upload | Avoids storage and bandwidth problems |
| Phases | Public site, admin and events come first |

## 11. Not decided yet
- Hosting details, domain and TLS (waiting for IT).
- Where uploaded files are stored.
- Backup target.
- Whether content needs head approval before publishing.
