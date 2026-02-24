-- Comments & Annotations Extensions
-- Extends decision_comments with option_id, mentions, status, edited_by for threaded comments and moderation
-- Adds decision_notifications for in-app mentions and activity

-- Extend decision_comments
ALTER TABLE public.decision_comments
  ADD COLUMN IF NOT EXISTS option_id UUID REFERENCES public.decision_options(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mentions JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'edited', 'deleted')),
  ADD COLUMN IF NOT EXISTS edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_decision_comments_option ON public.decision_comments(option_id) WHERE option_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_decision_comments_parent ON public.decision_comments(parent_id) WHERE parent_id IS NOT NULL;

-- Decision notifications (in-app mentions, comments, approvals)
CREATE TABLE IF NOT EXISTS public.decision_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention', 'comment', 'approval', 'changes_requested', 'reminder')),
  reference_id UUID,
  payload JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_notifications_user ON public.decision_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_notifications_decision ON public.decision_notifications(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_notifications_read ON public.decision_notifications(read_at) WHERE read_at IS NULL;

ALTER TABLE public.decision_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON public.decision_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Policy: allow read via share link for client portal (decision_comments)
-- Client portal uses token-based access; RLS for share links handled via client_links
-- Add policy for client portal to read comments when token is valid (via service role or anon function)
