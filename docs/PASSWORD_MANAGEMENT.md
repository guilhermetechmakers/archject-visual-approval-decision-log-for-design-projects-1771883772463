# Password Management - Deployment & Configuration

## Overview

The Password Management system provides:
- **Forgot password**: Time-limited (60 min), single-use reset tokens stored hashed in DB
- **Reset password**: Token validation, password update, audit logging
- **Change password**: Authenticated flow with current password verification
- **SendGrid integration**: Templated emails for reset request and confirmation

## Database

### Migration

Run the migration to create `password_reset_tokens`:

```bash
supabase db push
# or
supabase migration up
```

The migration creates:
- `password_reset_tokens` table (token_hash, user_id, expires_at, used_at, etc.)
- RLS enabled (service role only; no direct client access)

### Audit Logs

Password events are logged to `audit_logs` with actions:
- `password_reset_requested`
- `password_reset_used`
- `password_changed`

## Edge Functions

Deploy the Edge Functions:

```bash
supabase functions deploy forgot-password
supabase functions deploy reset-password
supabase functions deploy change-password
supabase functions deploy validate-reset-token
```

### Required Secrets

Set via Supabase Dashboard or CLI:

```bash
# SendGrid (required for email delivery)
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key

# App URL for reset links (e.g. https://app.archject.com)
supabase secrets set APP_URL=https://your-app-domain.com

# Optional: custom from email
supabase secrets set SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| SENDGRID_API_KEY | Yes (for email) | SendGrid API key for transactional email |
| APP_URL | Yes | Base URL for reset links (e.g. https://app.example.com) |
| SENDGRID_FROM_EMAIL | No | From address (default: noreply@archject.com) |

## Frontend

When Supabase is configured (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), the auth API automatically uses Edge Functions for:
- `forgotPassword` → `forgot-password`
- `resetPassword` → `reset-password`
- `changePassword` → `change-password`

No additional frontend configuration is needed.

## Routes

- `/auth/password-reset` – Request reset (email input)
- `/auth/reset-password/:token` – Set new password (token from email link)
- `/auth/password-reset/confirm?token=...` – Alternative token-in-query flow
- `/dashboard/settings/security` – Change password (authenticated)

## Security

- Tokens are hashed (SHA-256) before storage; plaintext never stored
- Tokens are single-use (`used_at` enforced)
- Tokens expire in 60 minutes
- Generic success messages (no email enumeration)
- Password policy: min 12 chars, upper, lower, number, symbol
- Audit logging for all password events

## Rollback

To disable custom password flows and use Supabase built-in reset:

1. Remove or don't set `SENDGRID_API_KEY` (emails won't send; tokens still created)
2. To fully rollback: revert auth API to use `supabase.auth.resetPasswordForEmail()` for forgot-password and Supabase's recovery flow for reset
