# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take the security of the Autonomous Lunar Habitat Infrastructure very seriously.

If you discover a security vulnerability, please **DO NOT** create a public GitHub issue. Instead, please report it privately:

1. Navigate to the **Security** tab of this repository on GitHub.
2. Under "Reporting", click on **"Report a vulnerability"** to open a private advisory draft.
3. Provide a detailed summary of the vulnerability, including:
   - Affected components (e.g., authentication, API endpoints, telemetry stream).
   - Step-by-step reproduction instructions or proof-of-concept payload.
   - Potential impact of the vulnerability.

We will review the advisory and coordinate a fix and release.

## Security Best Practices for Production

- **Credentials:** Always override default seed credentials (`admin`, `operator`, etc.) by configuring strong passwords and injecting `JWT_SECRET` via environment variables.
- **Database:** Do not use default or empty database passwords in production environments. Configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` securely.
- **Secrets Management:** Never commit `.env` files or certificates to version control.
