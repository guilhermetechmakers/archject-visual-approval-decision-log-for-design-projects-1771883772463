-- Search & Filter - saved searches and search audit
-- Full-text search uses existing tables via RPC; this migration adds saved searches and audit

-- Saved searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL DEFAULT '',
  filters JSONB DEFAULT '[]',
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_workspace ON public.saved_searches(workspace_id);

-- Trigger: set user_id from auth.uid() on insert when not provided
CREATE OR REPLACE FUNCTION public.set_saved_search_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_saved_search_user_id ON public.saved_searches;
CREATE TRIGGER trg_saved_search_user_id
  BEFORE INSERT OR UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE PROCEDURE public.set_saved_search_user_id();

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved searches" ON public.saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- Search audit (for analytics and abuse detection)
CREATE TABLE IF NOT EXISTS public.search_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT,
  filters JSONB,
  result_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_audit_user ON public.search_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_search_audit_created ON public.search_audit_log(created_at);

ALTER TABLE public.search_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own search audit" ON public.search_audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC: search_unified - full-text search across projects, decisions, files, comments
-- Uses ILIKE for simple matching; RLS ensures access control
CREATE OR REPLACE FUNCTION public.search_unified(
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_status TEXT[] DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 25,
  p_sort_field TEXT DEFAULT 'updated_at',
  p_sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  project_id UUID,
  project_name TEXT,
  title TEXT,
  excerpt TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_id UUID,
  href TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q_pattern TEXT;
  offset_val INT;
BEGIN
  q_pattern := '%' || COALESCE(TRIM(p_query), '') || '%';
  offset_val := (GREATEST(p_page, 1) - 1) * GREATEST(LEAST(p_page_size, 100), 10);

  RETURN QUERY
  WITH search_results AS (
    -- Projects
    SELECT
      p.id,
      'project'::TEXT AS entity_type,
      p.id AS project_id,
      p.name AS project_name,
      p.name AS title,
      COALESCE(p.client_info::TEXT, '') AS excerpt,
      p.status::TEXT AS status,
      p.created_at,
      p.updated_at,
      NULL::UUID AS author_id,
      '/dashboard/projects/' || p.id::TEXT AS href
    FROM public.projects p
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND (p_query = '' OR p.name ILIKE q_pattern OR COALESCE(p.client_info::TEXT, '') ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'project' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR p.id = p_project_id)

    UNION ALL

    -- Decisions
    SELECT
      d.id,
      'decision'::TEXT,
      d.project_id,
      pr.name,
      d.title,
      COALESCE(d.description, '') AS excerpt,
      d.status::TEXT,
      d.created_at,
      d.updated_at,
      d.created_by AS author_id,
      '/dashboard/projects/' || d.project_id::TEXT || '/decisions/' || d.id::TEXT AS href
    FROM public.decisions d
    JOIN public.projects pr ON pr.id = d.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND d.deleted_at IS NULL
      AND (p_query = '' OR d.title ILIKE q_pattern OR COALESCE(d.description, '') ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'decision' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR d.project_id = p_project_id)
      AND (p_status IS NULL OR d.status::TEXT = ANY(p_status))

    UNION ALL

    -- Files
    SELECT
      pf.id,
      'file'::TEXT,
      pf.project_id,
      pr.name,
      pf.filename AS title,
      COALESCE(pf.mime_type, '') AS excerpt,
      'active'::TEXT,
      pf.uploaded_at AS created_at,
      pf.uploaded_at AS updated_at,
      pf.uploaded_by AS author_id,
      '/dashboard/projects/' || pf.project_id::TEXT || '/files' AS href
    FROM public.project_files pf
    JOIN public.projects pr ON pr.id = pf.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND (pf.is_deleted IS NOT TRUE)
      AND (p_query = '' OR pf.filename ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'file' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR pf.project_id = p_project_id)

    UNION ALL

    -- Comments
    SELECT
      dc.id,
      'comment'::TEXT,
      d.project_id,
      pr.name,
      LEFT(dc.text, 80) AS title,
      dc.text AS excerpt,
      COALESCE(dc.status, 'active') AS status,
      dc.created_at,
      COALESCE(dc.edited_at, dc.created_at) AS updated_at,
      dc.user_id AS author_id,
      '/dashboard/projects/' || d.project_id::TEXT || '/decisions/' || d.id::TEXT || '#comment-' || dc.id::TEXT AS href
    FROM public.decision_comments dc
    JOIN public.decisions d ON d.id = dc.decision_id
    JOIN public.projects pr ON pr.id = d.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND dc.status != 'deleted'
      AND (p_query = '' OR dc.text ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'comment' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR d.project_id = p_project_id)
  )
  SELECT
    sr.id,
    sr.entity_type,
    sr.project_id,
    sr.project_name,
    sr.title,
    sr.excerpt,
    sr.status,
    sr.created_at,
    sr.updated_at,
    sr.author_id,
    sr.href
  FROM search_results sr
  ORDER BY
    CASE WHEN p_sort_field = 'title' AND p_sort_order = 'asc' THEN sr.title END ASC,
    CASE WHEN p_sort_field = 'title' AND p_sort_order = 'desc' THEN sr.title END DESC,
    CASE WHEN p_sort_field = 'created_at' AND p_sort_order = 'asc' THEN sr.created_at END ASC,
    CASE WHEN p_sort_field = 'created_at' AND p_sort_order = 'desc' THEN sr.created_at END DESC,
    CASE WHEN p_sort_field = 'updated_at' AND p_sort_order = 'asc' THEN sr.updated_at END ASC,
    CASE WHEN p_sort_field = 'updated_at' AND p_sort_order = 'desc' THEN sr.updated_at END DESC,
    sr.updated_at DESC
  OFFSET offset_val
  LIMIT GREATEST(LEAST(p_page_size, 100), 10);
END;
$$;

-- RPC: search_autocomplete - lightweight suggestions
CREATE OR REPLACE FUNCTION public.search_autocomplete(
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT NULL,
  p_limit INT DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  title TEXT,
  excerpt TEXT,
  href TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q_pattern TEXT;
BEGIN
  q_pattern := '%' || COALESCE(TRIM(p_query), '') || '%';
  IF LENGTH(TRIM(COALESCE(p_query, ''))) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  (
    SELECT p.id, 'project'::TEXT, p.name AS title, ''::TEXT AS excerpt,
      '/dashboard/projects/' || p.id::TEXT AS href
    FROM public.projects p
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND p.name ILIKE q_pattern
      AND (p_entity_types IS NULL OR 'project' = ANY(p_entity_types))
    LIMIT 3
  )
  UNION ALL
  (
    SELECT d.id, 'decision'::TEXT, d.title, COALESCE(d.description, '') AS excerpt,
      '/dashboard/projects/' || d.project_id::TEXT || '/decisions/' || d.id::TEXT AS href
    FROM public.decisions d
    JOIN public.projects pr ON pr.id = d.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND d.deleted_at IS NULL
      AND (d.title ILIKE q_pattern OR COALESCE(d.description, '') ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'decision' = ANY(p_entity_types))
    LIMIT 3
  )
  UNION ALL
  (
    SELECT pf.id, 'file'::TEXT, pf.filename AS title, ''::TEXT AS excerpt,
      '/dashboard/projects/' || pf.project_id::TEXT || '/files' AS href
    FROM public.project_files pf
    JOIN public.projects pr ON pr.id = pf.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND (pf.is_deleted IS NOT TRUE)
      AND pf.filename ILIKE q_pattern
      AND (p_entity_types IS NULL OR 'file' = ANY(p_entity_types))
    LIMIT 2
  )
  LIMIT p_limit;
END;
$$;

-- RPC: search_unified_count - total count for pagination
CREATE OR REPLACE FUNCTION public.search_unified_count(
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_status TEXT[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q_pattern TEXT;
  cnt INTEGER;
BEGIN
  q_pattern := '%' || COALESCE(TRIM(p_query), '') || '%';

  SELECT COUNT(*)::INTEGER INTO cnt FROM (
    SELECT 1 FROM public.projects p
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND (p_query = '' OR p.name ILIKE q_pattern OR COALESCE(p.client_info::TEXT, '') ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'project' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR p.id = p_project_id)

    UNION ALL

    SELECT 1 FROM public.decisions d
    JOIN public.projects pr ON pr.id = d.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND d.deleted_at IS NULL
      AND (p_query = '' OR d.title ILIKE q_pattern OR COALESCE(d.description, '') ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'decision' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR d.project_id = p_project_id)
      AND (p_status IS NULL OR d.status::TEXT = ANY(p_status))

    UNION ALL

    SELECT 1 FROM public.project_files pf
    JOIN public.projects pr ON pr.id = pf.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND (pf.is_deleted IS NOT TRUE)
      AND (p_query = '' OR pf.filename ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'file' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR pf.project_id = p_project_id)

    UNION ALL

    SELECT 1 FROM public.decision_comments dc
    JOIN public.decisions d ON d.id = dc.decision_id
    JOIN public.projects pr ON pr.id = d.project_id
    JOIN public.user_workspace_links uwl ON uwl.workspace_id = pr.workspace_id
    WHERE uwl.user_id = auth.uid() AND uwl.status = 'active'
      AND dc.status != 'deleted'
      AND (p_query = '' OR dc.text ILIKE q_pattern)
      AND (p_entity_types IS NULL OR 'comment' = ANY(p_entity_types))
      AND (p_project_id IS NULL OR d.project_id = p_project_id)
  ) sub;

  RETURN cnt;
END;
$$;
