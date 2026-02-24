-- Decision Objects CRUD - Extended schema for full Decision lifecycle
-- Extends existing decisions table and adds: options, approvals, comments, attachments, versions, share_links, assignees, reminders

-- Add new columns to decisions (if not exists)
ALTER TABLE public.decisions
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reminder_schedule JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS share_link_id UUID,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Add 'approved' to decision_status if using custom enum, or ensure compatibility
-- Existing: draft, pending, accepted, rejected. Map 'accepted' -> 'approved' in app layer.

-- Decision options (normalized from options JSONB)
CREATE TABLE IF NOT EXISTS public.decision_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  specs_url TEXT,
  layout_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_options_decision ON public.decision_options(decision_id);

-- Approval status enum
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Decision approvals
CREATE TABLE IF NOT EXISTS public.decision_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  comments TEXT
);

CREATE INDEX IF NOT EXISTS idx_decision_approvals_decision ON public.decision_approvals(decision_id);

-- Decision comments
CREATE TABLE IF NOT EXISTS public.decision_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.decision_comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  attachment_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_decision_comments_decision ON public.decision_comments(decision_id);

-- Decision attachments
CREATE TABLE IF NOT EXISTS public.decision_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.decision_options(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_attachments_decision ON public.decision_attachments(decision_id);

-- Decision versions (history)
CREATE TABLE IF NOT EXISTS public.decision_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data_snapshot JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_decision_versions_decision ON public.decision_versions(decision_id);

-- Share link scope enum
CREATE TYPE public.share_link_scope AS ENUM ('read', 'edit');

-- Decision share links
CREATE TABLE IF NOT EXISTS public.decision_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_flag BOOLEAN DEFAULT FALSE,
  scope share_link_scope NOT NULL DEFAULT 'read',
  remaining_uses INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_share_links_decision ON public.decision_share_links(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_share_links_token ON public.decision_share_links(token);

-- Add FK for decisions.share_link_id
ALTER TABLE public.decisions
  DROP CONSTRAINT IF EXISTS fk_decisions_share_link;
ALTER TABLE public.decisions
  ADD CONSTRAINT fk_decisions_share_link
  FOREIGN KEY (share_link_id) REFERENCES public.decision_share_links(id) ON DELETE SET NULL;

-- Decision assignees (many-to-many)
CREATE TABLE IF NOT EXISTS public.decision_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'assignee',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(decision_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_decision_assignees_decision ON public.decision_assignees(decision_id);

-- Reminder method enum
CREATE TYPE public.reminder_method AS ENUM ('email', 'slack');
CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'dismissed');

-- Decision reminders
CREATE TABLE IF NOT EXISTS public.decision_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  method reminder_method NOT NULL DEFAULT 'email',
  status reminder_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_reminders_decision ON public.decision_reminders(decision_id);

-- Approval rules (who can approve, required approvals, etc.) - stored in decision metadata or separate
CREATE TABLE IF NOT EXISTS public.decision_approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  required BOOLEAN DEFAULT TRUE,
  deadline TIMESTAMPTZ,
  allow_comments BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_approval_rules_decision ON public.decision_approval_rules(decision_id);

-- RLS for new tables
ALTER TABLE public.decision_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_approval_rules ENABLE ROW LEVEL SECURITY;

-- Policy: project members can manage decision_options
CREATE POLICY "Project members can manage decision_options" ON public.decision_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_options.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_approvals
CREATE POLICY "Project members can manage decision_approvals" ON public.decision_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_approvals.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_comments
CREATE POLICY "Project members can manage decision_comments" ON public.decision_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_comments.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_attachments
CREATE POLICY "Project members can manage decision_attachments" ON public.decision_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_attachments.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_versions
CREATE POLICY "Project members can manage decision_versions" ON public.decision_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_versions.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_share_links
CREATE POLICY "Project members can manage decision_share_links" ON public.decision_share_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_share_links.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_assignees
CREATE POLICY "Project members can manage decision_assignees" ON public.decision_assignees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_assignees.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_reminders
CREATE POLICY "Project members can manage decision_reminders" ON public.decision_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_reminders.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: project members can manage decision_approval_rules
CREATE POLICY "Project members can manage decision_approval_rules" ON public.decision_approval_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_approval_rules.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Fix: decisions.share_link_id FK - must create decision_share_links first
-- The FK was added above; ensure decision_share_links exists before that runs.
-- Reorder: create decision_share_links before adding FK to decisions.
-- Already created above. The FK add might fail if share_link_id column doesn't exist - we added it.
-- Some DBs require the referenced table to exist before the FK. We're good.

-- Index for soft delete and filtering
CREATE INDEX IF NOT EXISTS idx_decisions_deleted_at ON public.decisions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_decisions_version ON public.decisions(version);
CREATE INDEX IF NOT EXISTS idx_decisions_assignee ON public.decisions(assignee_id);
