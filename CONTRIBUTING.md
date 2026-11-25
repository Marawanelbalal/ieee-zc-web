# Contributing

1. Pick the issue assigned to you. One assignee per issue.
2. Branch from `main`: `git switch -c <issue-number>-short-name`
3. Keep the PR small and about one issue. Put `Closes #<number>` in the description.
4. Run the app locally and check the issue's acceptance check before asking for review.
5. Open a PR. `main` is protected: no direct pushes, one approval required.

API structure (`apps/api/src`), one folder per feature:
```
routes.ts                  mounts every feature router
modules/<feature>/
  <feature>.routes.ts      URLs, middleware, validation
  <feature>.service.ts     business rules and Drizzle queries
middleware/                auth, validate, error handler
db/                        Drizzle schema and client
```

API rules:
- Routes handle HTTP only. Business logic and permission checks live in services.
- Only services touch the database.
- Validate all input with the Zod schemas in `packages/shared`.
- Public reads: `GET /api/<feature>`. Admin writes: `/api/admin/<feature>`.
- Services throw `AppError(status, code, message)`. One handler formats it.
- A new feature gets a new folder. The only shared edit is one line in `routes.ts`.

Never commit secrets, real names or student IDs. Use `.env` locally (it is git-ignored).
