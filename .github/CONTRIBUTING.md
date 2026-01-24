# Contributing

Quick guide for the team to keep things clean during the hackathon.

## Branch Naming

```
type/short-description
```

Examples:
- `feat/auth-login-page`
- `fix/firebase-connection`
- `refactor/api-routes`
- `chore/eslint-config`

Types: `feat`, `fix`, `refactor`, `chore`, `docs`

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/), lowercase:

```
type(scope): description

- bullet point explaining change
- another point if needed
```

Examples:
- `feat(auth): added firebase google sign-in`
- `fix(api): resolved null pointer on user fetch`
- `chore(deps): updated next.js to 14.x`

Rules:
- Lowercase everything (except code references like `UserAuth`, `API_KEY`)
- Imperative mood ("added", "removed" not "add", "remove")
- Keep the first line under 72 characters
- Use `!` for breaking changes: `feat(api)!: changed response format`

## PR Process

1. Create a branch from `main` using the naming convention above
2. Make your changes, commit with conventional commits
3. Push and open a PR — fill out the template
4. Tag at least one teammate for review
5. Squash merge into `main` once approved

## Quick Rules

- **Never** push directly to `main`
- Pull `main` before creating a new branch
- Keep PRs small and focused (one feature/fix per PR)
- If something is blocked, comment on the issue and move on
