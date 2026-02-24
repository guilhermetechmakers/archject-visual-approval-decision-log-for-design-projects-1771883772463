-- Project & Workspace Management
-- Projects, branding, templates, decisions, files, invitations, RBAC, client links

-- Add quotas and usage to workspaces
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS quotas JSONB DEFAULT '{"storage_bytes": 5368709120, "decision_count": 1000}',
  ADD COLUMN IF NOT EXISTS usage JSONB DEFAULT '{"storage_bytes": 0, "decision_count": 0}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Project status enum
CREATE TYPE public.project_status AS ENUM ('active', 'archived', 'on_hold');
CREATE TYPE public.decision_status AS ENUM ('draft', 'pending', 'accepted', 'rejected');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired');
CREATE TYPE public.project_role AS ENUM ('owner', 'admin', 'editor', 'viewer', 'client');

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_info JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  template_id UUID,
  quota JSONB DEFAULT '{"storage_bytes": 1073741824, "decision_count": 100}',
  usage JSONB DEFAULT '{"storage_bytes": 0, "decision_count": 0}',
  status project_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  UNIQUE(workspace_id, name)
);

-- Branding (workspace or project level)
CREATE TABLE IF NOT EXISTS public.branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('workspace', 'project')),
  owner_id UUID NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#195C4A',
  secondary_color TEXT,
  font_settings JSONB DEFAULT '{}',
  banner_url TEXT,
  css_overrides TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision templates
CREATE TABLE IF NOT EXISTS public.decision_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  default_decision_options JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK for projects.template_id
ALTER TABLE public.projects
  ADD CONSTRAINT fk_projects_template
  FOREIGN KEY (template_id) REFERENCES public.decision_templates(id) ON DELETE SET NULL;

-- Decisions
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  chosen_option_id TEXT,
  status decision_status NOT NULL DEFAULT 'pending',
  comments JSONB DEFAULT '[]',
  due_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Project files
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  version INT NOT NULL DEFAULT 1,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  associated_decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL
);

-- Project invitations
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role project_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project RBAC (project-level roles and scopes)
CREATE TABLE IF NOT EXISTS public.project_rbac (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role project_role NOT NULL DEFAULT 'viewer',
  scopes JSONB DEFAULT '["view"]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Client links (no-login access)
CREATE TABLE IF NOT EXISTS public.client_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  otp_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance audit_logs with target_type
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS target_type TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON public.projects(archived_at);
CREATE INDEX IF NOT EXISTS idx_decisions_project ON public.decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON public.decisions(status);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON public.project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON public.project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_project_rbac_project ON public.project_rbac(project_id);
CREATE INDEX IF NOT EXISTS idx_client_links_token ON public.client_links(token);
CREATE INDEX IF NOT EXISTS idx_client_links_project ON public.client_links(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_rbac ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Projects: workspace members can view; owners/admins can manage
CREATE POLICY "Workspace members can view projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_workspace_links uwl
      JOIN public.workspaces w ON w.id = projects.workspace_id
      WHERE uwl.workspace_id = projects.workspace_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Workspace members can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_workspace_links
      WHERE workspace_id = projects.workspace_id AND user_id = auth.uid() AND status = 'active'
    )
  );
CREATE POLICY "Workspace admins can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_workspace_links uwl
      WHERE uwl.workspace_id = projects.workspace_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
        AND uwl.role IN ('owner', 'admin')
    )
  );

-- Decisions: project members can view/edit
CREATE POLICY "Project members can view decisions" ON public.decisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = decisions.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage decisions" ON public.decisions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = decisions.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Project files: project members
CREATE POLICY "Project members can view files" ON public.project_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = project_files.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage files" ON public.project_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = project_files.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Client links: project members can manage
CREATE POLICY "Project members can manage client links" ON public.client_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = client_links.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Notifications: users can view own
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
