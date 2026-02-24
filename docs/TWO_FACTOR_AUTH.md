# Two-Factor Authentication (2FA)

## Overview

Archject supports optional Two-Factor Authentication (2FA) via:
- **TOTP (Authenticator app)** – Google Authenticator, Authy, etc.
- **SMS OTP** – Fallback via Twilio (when configured)

## Architecture

### Backend (Supabase Edge Functions)

| Function | Purpose |
|----------|---------|
| `2fa-status` | Get current user 2FA status (enabled, method, masked phone) |
| `2fa-setup-totp` | Generate TOTP secret and otpauth URL for QR code |
| `2fa-verify-totp` | Verify 6-digit code, enable 2FA, generate recovery codes |
| `2fa-enroll-sms` | Send SMS OTP to phone (E.164), rate-limited |
| `2fa-verify-sms` | Verify SMS code, enable 2FA, generate recovery codes |
| `2fa-disable` | Disable 2FA (requires password re-auth) |
| `2fa-recovery-codes-regenerate` | Regenerate recovery codes (requires password) |
| `2fa-audit` | Fetch 2FA-related audit log entries |

### Database Tables

- **user_2fa_config** – `user_id`, `is_enabled`, `method` (totp/sms), `totp_secret`, `phone_number`
- **recovery_codes** – Hashed recovery codes, single-use
- **otp_attempts** – Rate limiting and fraud detection
- **sms_otp_pending** – Pending SMS verification (Twilio)

### Frontend

- **Settings → Security & Compliance** – 2FA card with enrollment flows
- **TwoFACard** – Toggle, status badge, TOTP/SMS enrollment
- **TwoFATOTPEnrollment** – QR code (qrcode.react), secret, verify
- **TwoFASMSEnrollment** – Phone input, OTP verify
- **TwoFARecoveryCodes** – Regenerate with password
- **TwoFAAuditLog** – 2FA activity list

## Security

- Recovery codes stored hashed (bcrypt/SHA-256)
- TOTP secrets never exposed after setup
- Password required for disable and recovery code regeneration
- Rate limiting on OTP sends (5/hour per user)
- Audit logging for all 2FA events

## Twilio Setup (SMS)

1. `supabase secrets set TWILIO_ACCOUNT_SID=...`
2. `supabase secrets set TWILIO_AUTH_TOKEN=...`
3. `supabase secrets set TWILIO_PHONE_NUMBER=+1...`

If Twilio is not configured, SMS enrollment shows a fallback message; users can use TOTP only.

## Extending

- **Hardware keys (WebAuthn)** – Add `2fa-enroll-webauthn` and `2fa-verify-webauthn`
- **Push-based 2FA** – Integrate with a push notification provider
- **Enterprise MFA** – Add plan-based gating in middleware
