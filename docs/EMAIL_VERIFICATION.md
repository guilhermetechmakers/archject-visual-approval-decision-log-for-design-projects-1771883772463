# Email Verification

Archject uses a custom email verification flow with Supabase Edge Functions and SendGrid for transactional emails.

## Overview

- **Token-based**: One-time, hashed tokens stored in `verification_tokens` table
- **24-hour expiry**: Tokens expire after 24 hours
- **Rate limiting**: Max 3 resend requests per 24 hours per user; 15-minute cooldown between resends
- **SendGrid**: Transactional emails for verification links

## Database

- `verification_tokens`: Stores hashed tokens, jti, expiry, used_at
- `profiles.last_verification_requested_at`: Used for rate limiting

Run migration:
```bash
supabase db push
```

## Edge Functions

| Function | Purpose |
|----------|---------|
| `auth-verify-email` | Validates token, marks user verified, invalidates token |
| `auth-resend-verification` | Sends new verification email (rate-limited) |
| `auth-send-verification-email` | Sends initial verification email after signup |

Deploy:
```bash
supabase functions deploy auth-verify-email
supabase functions deploy auth-resend-verification
supabase functions deploy auth-send-verification-email
```

## Environment Variables (Supabase Secrets)

```bash
supabase secrets set SENDGRID_API_KEY=your_key
supabase secrets set APP_URL=https://yourapp.com
supabase secrets set SENDGRID_FROM_EMAIL=noreply@yourapp.com
supabase secrets set SENDGRID_FROM_NAME="Archject"
```

## User Flow

1. **Signup**: User signs up → `auth-send-verification-email` sends email → redirect to `/auth/verify`
2. **Click link**: User clicks link in email → `/verify?token=xxx` → redirects to `/auth/verify?token=xxx` → `auth-verify-email` validates token → success
3. **Resend**: User can resend from verification page (with email if needed) → `auth-resend-verification` enforces rate limit → sends new email

## API Integration

When Supabase is configured, the frontend uses:
- `authApi.verifyToken({ token })` → `auth-verify-email`
- `authApi.resendVerificationToken({ email?, token? })` → `auth-resend-verification`
- `authApi.sendVerificationEmail(userId)` → `auth-send-verification-email`

## Routes

- `/auth/verify` – Main verification page (token validation, resend, status)
- `/verify` – Redirects to `/auth/verify` (preserves `?token=` for email links)
