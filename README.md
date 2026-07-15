# 6-Feature Game Dataset Download Page

Authorized download page for the `mjudcd-paper-data/6feature-identify` MinIO dataset.

## Environment variables

Production expects these secrets:

- `data_env`: newline-separated `DATA_URL_*=` values for the 41 dataset objects.
- `auth_env`: authorization users and expiration dates.
- `AUTH_SESSION_SECRET`: random string used to sign the session cookie.

Example `auth_env`:

```text
user1_auth = { code = "replace-with-code" }
user1_expire_date = "2026-12-31"
```

Add more users with `user2_auth`, `user2_expire_date`, and so on.

## Local development

```bash
npm install
npm run dev
```

The page is available at `http://localhost:3000`.
