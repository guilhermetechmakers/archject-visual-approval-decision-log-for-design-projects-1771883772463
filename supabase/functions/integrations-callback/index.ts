/**
 * Integrations Callback - Handle OAuth callback, exchange code for tokens, store
 * GET ?code=...&state=...
 * Redirects to app with success/error
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const APP_REDIRECT = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=${encodeURIComponent(error)}`
    return Response.redirect(redirect, 302)
  }

  if (!code || !state) {
    const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=missing_params`
    return Response.redirect(redirect, 302)
  }

  let parsed: { userId?: string; provider?: string; projectId?: string; workspaceId?: string }
  try {
    parsed = JSON.parse(atob(state))
  } catch {
    const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=invalid_state`
    return Response.redirect(redirect, 302)
  }

  const { userId, provider, projectId, workspaceId } = parsed
  if (!userId || !provider) {
    const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=invalid_state`
    return Response.redirect(redirect, 302)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (provider === 'google_calendar') {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') ?? `${supabaseUrl}/functions/v1/integrations-callback`
    if (!clientId || !clientSecret) {
      const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=config`
      return Response.redirect(redirect, 302)
    }
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=token_exchange`
      return Response.redirect(redirect, 302)
    }
    const tokens = await tokenRes.json()
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', 'google_calendar')
      .eq('user_id', userId)
      .or(projectId ? `project_id.eq.${projectId}` : 'project_id.is.null')
      .maybeSingle()

    const row = {
      provider: 'google_calendar',
      user_id: userId,
      project_id: projectId || null,
      workspace_id: workspaceId || null,
      status: 'connected',
      access_token_encrypted: tokens.access_token,
      refresh_token_encrypted: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
      config: {},
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      await supabase.from('integrations').update(row).eq('id', existing.id)
    } else {
      await supabase.from('integrations').insert(row)
    }

    await supabase.from('integration_audit_logs').insert({
      action: 'integration.connected',
      actor_id: userId,
      target_type: 'integration',
      metadata: { provider: 'google_calendar' },
    })

    const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?success=google_calendar`
    return Response.redirect(redirect, 302)
  }

  if (provider === 'autodesk_forge') {
    const clientId = Deno.env.get('FORGE_CLIENT_ID')
    const clientSecret = Deno.env.get('FORGE_CLIENT_SECRET')
    const redirectUri = Deno.env.get('FORGE_REDIRECT_URI') ?? `${supabaseUrl}/functions/v1/integrations-callback`
    if (!clientId || !clientSecret) {
      const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=config`
      return Response.redirect(redirect, 302)
    }
    const tokenRes = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })
    if (!tokenRes.ok) {
      const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=token_exchange`
      return Response.redirect(redirect, 302)
    }
    const tokens = await tokenRes.json()
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', 'autodesk_forge')
      .eq('user_id', userId)
      .or(projectId ? `project_id.eq.${projectId}` : 'project_id.is.null')
      .maybeSingle()

    const row = {
      provider: 'autodesk_forge',
      user_id: userId,
      project_id: projectId || null,
      workspace_id: workspaceId || null,
      status: 'connected',
      access_token_encrypted: tokens.access_token,
      refresh_token_encrypted: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
      config: {},
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      await supabase.from('integrations').update(row).eq('id', existing.id)
    } else {
      await supabase.from('integrations').insert(row)
    }

    await supabase.from('integration_audit_logs').insert({
      action: 'integration.connected',
      actor_id: userId,
      target_type: 'integration',
      metadata: { provider: 'autodesk_forge' },
    })

    const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?success=autodesk_forge`
    return Response.redirect(redirect, 302)
  }

  const redirect = `${APP_REDIRECT}/dashboard/settings/integrations?error=unknown_provider`
  return Response.redirect(redirect, 302)
})
