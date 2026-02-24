-- Search & Filter - total count and facet support for pagination
-- Extends search_unified with count RPC and facet aggregation

-- RPC: search_unified_count - returns total matching rows for pagination
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
  total_count INTEGER;
BEGIN
  q_pattern := '%' || COALESCE(TRIM(p_query), '') || '%';

  SELECT COUNT(*)::INTEGER INTO total_count
  FROM (
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

  RETURN total_count;
END;
$$;
