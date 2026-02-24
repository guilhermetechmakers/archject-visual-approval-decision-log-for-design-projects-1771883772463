-- File Upload & Management - Versioning, previews, deduplication, decision linking
-- Extends project_files with: hash, storage_key, cloudinary_public_id, lifecycle_state
-- Adds: file_versions, file_asset_links, upload_jobs, audit_log extensions

-- Preview status enum for file versions
CREATE TYPE public.preview_status AS ENUM ('queued', 'processing', 'available', 'failed');

-- Lifecycle state for files (S3 lifecycle)
CREATE TYPE public.file_lifecycle_state AS ENUM ('active', 'archived', 'deleted');

-- Extend project_files with new columns
ALTER TABLE public.project_files
  ADD COLUMN IF NOT EXISTS hash TEXT,
  ADD COLUMN IF NOT EXISTS storage_key TEXT,
  ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'drawing' CHECK (file_type IN ('drawing', 'spec', 'image', 'BIM')),
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lifecycle_state file_lifecycle_state DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';

-- File versions (for version history and deduplication)
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  cloudinary_asset_id TEXT,
  size BIGINT DEFAULT 0,
  hash TEXT,
  metadata_json JSONB DEFAULT '{}',
  notes TEXT,
  preview_url TEXT,
  preview_status preview_status NOT NULL DEFAULT 'queued',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_id, version_number)
);

-- Asset links (file_version <-> decision/option)
CREATE TABLE IF NOT EXISTS public.file_asset_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_version_id UUID NOT NULL REFERENCES public.file_versions(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES public.decisions(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.decision_options(id) ON DELETE SET NULL,
  relation_type TEXT NOT NULL DEFAULT 'primary' CHECK (relation_type IN ('primary', 'alternate', 'reference')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_version_id, decision_id, option_id)
);

-- Upload jobs (for resumable/chunked upload tracking)
CREATE TABLE IF NOT EXISTS public.upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  upload_token TEXT UNIQUE,
  file_id UUID REFERENCES public.project_files(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_file_versions_file ON public.file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_hash ON public.file_versions(hash) WHERE hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_asset_links_version ON public.file_asset_links(file_version_id);
CREATE INDEX IF NOT EXISTS idx_file_asset_links_decision ON public.file_asset_links(decision_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_project ON public.upload_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_token ON public.upload_jobs(upload_token);
CREATE INDEX IF NOT EXISTS idx_project_files_hash ON public.project_files(hash) WHERE hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_files_project ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_deleted ON public.project_files(is_deleted) WHERE is_deleted = FALSE;

-- RLS
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_asset_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_jobs ENABLE ROW LEVEL SECURITY;

-- Projects: workspace members can view; owners/admins can manage
CREATE POLICY "Project members can view file_versions" ON public.file_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE pf.id = file_versions.file_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage file_versions" ON public.file_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE pf.id = file_versions.file_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

CREATE POLICY "Project members can view file_asset_links" ON public.file_asset_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.file_versions fv
      JOIN public.project_files pf ON pf.id = fv.file_id
      JOIN public.projects p ON p.id = pf.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE fv.id = file_asset_links.file_version_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage file_asset_links" ON public.file_asset_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.file_versions fv
      JOIN public.project_files pf ON pf.id = fv.file_id
      JOIN public.projects p ON p.id = pf.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE fv.id = file_asset_links.file_version_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

CREATE POLICY "Project members can view own upload_jobs" ON public.upload_jobs
  FOR SELECT USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = upload_jobs.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
CREATE POLICY "Project members can manage own upload_jobs" ON public.upload_jobs
  FOR ALL USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE p.id = upload_jobs.project_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
