-- Forge tokens and asset type extensions for BIM/CAD preview support

ALTER TABLE public.decision_annotations
  ADD COLUMN IF NOT EXISTS author_name TEXT;

CREATE TABLE IF NOT EXISTS public.forge_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.decision_attachments(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forge_tokens_asset ON public.forge_tokens(asset_id);
CREATE INDEX IF NOT EXISTS idx_forge_tokens_expires ON public.forge_tokens(expires_at);

ALTER TABLE public.decision_attachments
  ADD COLUMN IF NOT EXISTS forge_asset_id TEXT,
  ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'image';

ALTER TABLE public.forge_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can manage forge_tokens" ON public.forge_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decision_attachments da
      JOIN public.decisions d ON d.id = da.decision_id
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE da.id = forge_tokens.asset_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );
