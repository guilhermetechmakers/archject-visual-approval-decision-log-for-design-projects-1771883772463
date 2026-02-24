-- Light Tasking & Webhook Triggers
-- Tasks linked to decisions; webhook endpoints with HMAC signing, retries, audit

-- Task status and priority enums
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE public.task_priority AS ENUM ('low', 'med', 'high');

-- Tasks: linked to decisions, assignees, due dates
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'med',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events enum for filtering
CREATE TYPE public.webhook_event AS ENUM (
  'decision.created',
  'decision.approved',
  'decision.rejected',
  'decision.revoked',
  'options.updated',
  'comment.added',
  'reminder.sent'
);

-- Webhook endpoints: per-project, HMAC signing, event filters
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  signing_secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  retry_settings JSONB DEFAULT '{"maxAttempts": 5, "initialDelayMs": 1000, "maxDelayMs": 60000, "backoffMultiplier": 2}',
  last_triggered_at TIMESTAMPTZ,
  last_test_at TIMESTAMPTZ,
  last_test_status TEXT CHECK (last_test_status IN ('success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for webhook deliveries and task actions
CREATE TABLE IF NOT EXISTS public.webhook_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  payload_hash TEXT,
  status_code INT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  attempt INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_decision ON public.tasks(decision_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_project ON public.webhook_endpoints(project_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_enabled ON public.webhook_endpoints(enabled);
CREATE INDEX IF NOT EXISTS idx_webhook_audit_webhook ON public.webhook_audit_log(webhook_id);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_audit_log ENABLE ROW LEVEL SECURITY;

-- Tasks: project members can view/manage (via decision -> project)
CREATE POLICY "Project members can view tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = tasks.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = tasks.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Webhook endpoints: project members can manage
CREATE POLICY "Project members can view webhooks" ON public.webhook_endpoints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = webhook_endpoints.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage webhooks" ON public.webhook_endpoints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = webhook_endpoints.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Webhook audit: project members can view (via webhook -> project)
CREATE POLICY "Project members can view webhook audit" ON public.webhook_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.webhook_endpoints we
      JOIN public.projects p ON p.id = we.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE we.id = webhook_audit_log.webhook_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
