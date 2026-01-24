# contributing

quick guide for the team to keep things clean during the hackathon.

## branch naming

```
type/short-description
```

examples:
- `feat/auth-login-page`
- `fix/firebase-connection`
- `refactor/api-routes`
- `chore/eslint-config`

types: `feat`, `fix`, `refactor`, `chore`, `docs`

## commit messages

we use [conventional commits](https://www.conventionalcommits.org/), lowercase:

```
type(scope): description

- bullet point explaining change
- another point if needed
```

examples:
- `feat(auth): added firebase google sign-in`
- `fix(api): resolved null pointer on user fetch`
- `chore(deps): updated next.js to 14.x`

rules:
- lowercase everything (except code references like `UserAuth`, `API_KEY`)
- imperative mood ("added", "removed" not "add", "remove")
- keep the first line under 72 characters
- use `!` for breaking changes: `feat(api)!: changed response format`

## PR process

1. create a branch from `main` using the naming convention above
2. make your changes, commit with conventional commits
3. push and open a PR — fill out the template
4. tag at least one teammate for review
5. squash merge into `main` once approved

## quick rules

- **never** push directly to `main`
- pull `main` before creating a new branch
- keep PRs small and focused (one feature/fix per PR)
- if something is blocked, comment on the issue and move on
