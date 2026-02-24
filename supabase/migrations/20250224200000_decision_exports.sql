-- Decision Log Exports
-- Supports PDF, CSV, JSON exports with job queue, progress tracking, and artifact storage

CREATE TYPE public.export_format AS ENUM ('PDF', 'CSV', 'JSON');
CREATE TYPE public.export_status AS ENUM ('queued', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS public.decision_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'project' CHECK (scope IN ('project', 'decision')),
  decision_ids UUID[] DEFAULT '{}',
  format export_format NOT NULL,
  status export_status NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  artifact_url TEXT,
  artifact_size BIGINT,
  request_payload JSONB DEFAULT '{}',
  branding_profile_id UUID,
  include_signatures BOOLEAN DEFAULT FALSE,
  include_attachments BOOLEAN DEFAULT TRUE,
  backend_job_id TEXT,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_decision_exports_project ON public.decision_exports(project_id);
CREATE INDEX IF NOT EXISTS idx_decision_exports_status ON public.decision_exports(status);
CREATE INDEX IF NOT EXISTS idx_decision_exports_created ON public.decision_exports(created_at DESC);

-- Export logs for debugging and audit
CREATE TABLE IF NOT EXISTS public.export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_id UUID NOT NULL REFERENCES public.decision_exports(id) ON DELETE CASCADE,
  message TEXT,
  level TEXT DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_logs_export ON public.export_logs(export_id);

-- Branding profiles for export customization
CREATE TABLE IF NOT EXISTS public.branding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#195C4A',
  accent_color TEXT,
  typography_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branding_profiles_project ON public.branding_profiles(project_id);

-- RLS
ALTER TABLE public.decision_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_profiles ENABLE ROW LEVEL SECURITY;

-- Project members can create and view exports for their project
CREATE POLICY "Project members can manage decision_exports" ON public.decision_exports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = decision_exports.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

CREATE POLICY "Project members can view export_logs" ON public.export_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.decision_exports e
      JOIN public.projects p ON p.id = e.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE e.id = export_logs.export_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

CREATE POLICY "Project members can manage branding_profiles" ON public.branding_profiles
  FOR ALL USING (
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = branding_profiles.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    ))
    OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_workspace_links uwl
      WHERE uwl.workspace_id = branding_profiles.workspace_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    ))
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_decision_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decision_exports_updated ON public.decision_exports;
CREATE TRIGGER trigger_decision_exports_updated
  BEFORE UPDATE ON public.decision_exports
  FOR EACH ROW EXECUTE FUNCTION public.update_decision_exports_updated_at();
