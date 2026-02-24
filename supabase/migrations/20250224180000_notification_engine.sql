-- Notifications & Reminders Engine
-- notification_preferences, notification_templates, delivery_attempts, client_portal_otp
-- Extends decision_notifications for channel, status, mute/snooze

-- Extend decision_notifications for full notification engine
ALTER TABLE public.decision_notifications
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms')),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed')),
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS muted_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE INDEX IF NOT EXISTS idx_decision_notifications_idempotency ON public.decision_notifications(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_decision_notifications_status ON public.decision_notifications(status);
CREATE INDEX IF NOT EXISTS idx_decision_notifications_channel ON public.decision_notifications(channel);

-- Notification preferences (per-user, per-workspace)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channels JSONB NOT NULL DEFAULT '{"inApp": true, "email": true, "sms": false}',
  frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'digest')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  muted_until TIMESTAMPTZ,
  global_mute BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_user_global ON public.notification_preferences(user_id) WHERE workspace_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_user_workspace ON public.notification_preferences(user_id, workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_workspace ON public.notification_preferences(workspace_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Notification templates (email/SMS)
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  placeholders JSONB DEFAULT '[]',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, language, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON public.notification_templates(name);

-- Delivery attempts (for retries, audit)
CREATE TABLE IF NOT EXISTS public.notification_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.decision_notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms')),
  attempt_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  response_code INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_attempts_notification ON public.notification_delivery_attempts(notification_id);

ALTER TABLE public.notification_delivery_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read delivery attempts for own notifications" ON public.notification_delivery_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.decision_notifications n
      WHERE n.id = notification_id AND n.user_id = auth.uid()
    )
  );

-- Client portal OTP sessions (no-login verification)
CREATE TABLE IF NOT EXISTS public.client_portal_otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  link_token TEXT NOT NULL,
  user_email TEXT,
  user_phone TEXT,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_portal_otp_session_id ON public.client_portal_otp_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_otp_expires ON public.client_portal_otp_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_client_portal_otp_link_token ON public.client_portal_otp_sessions(link_token);

ALTER TABLE public.client_portal_otp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for client_portal_otp_sessions" ON public.client_portal_otp_sessions
  FOR ALL USING (false);

-- Notification exports (audit, history)
CREATE TABLE IF NOT EXISTS public.notification_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('json', 'csv')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  date_from DATE,
  date_to DATE,
  download_url TEXT,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_exports_user ON public.notification_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_exports_status ON public.notification_exports(status);

ALTER TABLE public.notification_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification exports" ON public.notification_exports
  FOR ALL USING (auth.uid() = user_id);

-- Notification export jobs (data export including notification history)
CREATE TABLE IF NOT EXISTS public.notification_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  format TEXT NOT NULL CHECK (format IN ('json', 'csv')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  date_from TIMESTAMPTZ,
  date_to TIMESTAMPTZ,
  download_url TEXT,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_exports_user ON public.notification_exports(user_id);

ALTER TABLE public.notification_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification exports" ON public.notification_exports
  FOR ALL USING (auth.uid() = user_id);

-- Seed default templates
INSERT INTO public.notification_templates (name, language, channel, subject, body_text, placeholders)
VALUES
  ('approval_needed', 'en', 'email', 'Approval needed: {{decision_title}}', 'A decision is awaiting your approval. Please review at {{portal_url}}.', '["decision_title", "portal_url"]'),
  ('approval_needed', 'en', 'sms', 'Approval needed: {{decision_title}}', 'A decision is awaiting your approval. Review: {{portal_url}}', '["decision_title", "portal_url"]'),
  ('comment_received', 'en', 'email', 'New comment on {{decision_title}}', 'Someone commented on a decision. View: {{portal_url}}', '["decision_title", "portal_url"]'),
  ('reminder', 'en', 'email', 'Reminder: {{decision_title}}', 'This is a reminder about a pending decision. Review: {{portal_url}}', '["decision_title", "portal_url"]'),
  ('otp_verification', 'en', 'sms', NULL, 'Your Archject verification code is: {{otp_code}}. Valid for 10 minutes.', '["otp_code"]')
ON CONFLICT (name, language, channel) DO NOTHING;
