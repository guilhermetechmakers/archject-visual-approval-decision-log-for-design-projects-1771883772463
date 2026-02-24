-- Decision Annotations - Store annotations per decision, option, and asset
-- Supports text notes, shapes (rectangles, polygons), and freehand drawings

CREATE TABLE IF NOT EXISTS public.decision_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.decision_options(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.decision_attachments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'shape', 'freehand')),
  data JSONB NOT NULL DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- data JSONB structure examples:
-- text: { "text": "...", "x": 0.1, "y": 0.2, "color": "#195C4A", "fontSize": 14 }
-- shape: { "shape": "rectangle"|"polygon", "coordinates": [[x,y],...], "color": "#...", "stroke": 2 }
-- freehand: { "points": [[x,y],...], "color": "#...", "stroke": 2 }

CREATE INDEX IF NOT EXISTS idx_decision_annotations_decision ON public.decision_annotations(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_annotations_option ON public.decision_annotations(option_id);
CREATE INDEX IF NOT EXISTS idx_decision_annotations_asset ON public.decision_annotations(asset_id);

ALTER TABLE public.decision_annotations ENABLE ROW LEVEL SECURITY;

-- Policy: project members can manage annotations
CREATE POLICY "Project members can manage decision_annotations" ON public.decision_annotations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = decision_annotations.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Policy: allow read via share link (for client portal) - requires decision_share_links check
-- Client portal uses token-based access; RLS for share links handled separately
