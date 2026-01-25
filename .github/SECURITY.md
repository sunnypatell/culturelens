# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it
responsibly by contacting the project maintainers directly rather than opening
a public issue.

## Best Practices for Contributors

- **Never** commit secrets, API keys, or credentials to the repository
- Use `.env` for all sensitive configuration (it's in `.gitignore`)
- Contact the project maintainer for shared firebase and API credentials
- Do NOT create your own firebase project or generate new admin SDK keys
- Keep dependencies up to date
- Review firebase security rules before deploying
