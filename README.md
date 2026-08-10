# 6-Feature Game Dataset Download Page

Authorized download page for the `mjudcd-paper-data/6feature-identify` MinIO dataset.

## Environment variables

Production expects these secrets:

- `MINIO_ENDPOINT`: public HTTPS endpoint that downloaders can reach, for example `https://downloads.example.org`.
- `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`: credentials authorized to sign `GetObject` requests for the dataset bucket.
- `MINIO_BUCKET` (optional; defaults to `mjudcd-paper-data`), `MINIO_PREFIX` (optional; defaults to `6feature-identify`), and `MINIO_REGION` (optional; defaults to `us-east-1`).
- Authorization users: either a newline-separated `auth_env` value or individual `userN_auth` and `userN_expire_date` variables. Individual variables override the same user in `auth_env`.
- `AUTH_SESSION_SECRET`: random string used to sign the session cookie.

The MinIO endpoint must be externally routable over HTTPS. Dataset objects should remain private; after
authorization, the application issues a presigned URL for only the requested allow-listed object. URLs expire
one hour after issue. The deprecated `data_env` and `DATA_URL_*` variables are not used.

Example individual authorization variables:

```text
user1_auth={ code = "replace-with-code" }
user1_expire_date=2026-12-31
```

Add more users with `user2_auth`, `user2_expire_date`, and so on. A user can download without limit until
the end of their configured expiration date (Korea Standard Time); after that date, their authorization code is
rejected.

## Local development

```bash
npm install
npm run dev
```

The page is available at `http://localhost:3000`.
