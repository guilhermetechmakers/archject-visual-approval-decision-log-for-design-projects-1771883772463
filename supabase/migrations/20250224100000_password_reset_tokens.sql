-- Password reset tokens for secure, time-limited, single-use reset flow
-- Tokens are hashed before storage; never store plaintext tokens

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_ip TEXT,
  device_info TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);

-- RLS: Only service role can access (Edge Functions use service role)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- No direct client access - all operations via Edge Functions with service role
CREATE POLICY "Service role only for password_reset_tokens" ON public.password_reset_tokens
  FOR ALL USING (false);

-- Extend audit_logs: add ip_address for password events (details JSONB can hold metadata)
-- Existing audit_logs has: id, user_id, action, target_id, timestamp, details
-- Action values for password events: password_reset_requested, password_reset_used, password_changed, login_attempt, etc.
-- No schema change needed - use existing 'action' and 'details' JSONB for ip_address, user_agent
