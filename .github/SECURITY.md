# security policy

## reporting a vulnerability

if you discover a security vulnerability in this project, please report it
responsibly by contacting the project maintainers directly rather than opening
a public issue.

## best practices for contributors

- **never** commit secrets, API keys, or credentials to the repository
- use `.env.local` for all sensitive configuration (it's in `.gitignore`)
- keep dependencies up to date
- review firebase security rules before deploying
