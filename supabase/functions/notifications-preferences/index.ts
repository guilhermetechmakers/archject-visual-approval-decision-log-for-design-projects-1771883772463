/**
 * Notification Engine - Get/Update preferences
 * GET/POST /notifications/preferences
 * User-level notification preferences: channels, frequency, quiet hours
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ message: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (userError || !user) {
    return new Response(
      JSON.stringify({ message: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const userId = user.id

  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: 'get' | 'update'
      workspaceId?: string
      channels?: { inApp?: boolean; email?: boolean; sms?: boolean }
      frequency?: 'immediate' | 'digest'
      quietHoursStart?: string
      quietHoursEnd?: string
      globalMute?: boolean
    }

    const action = body.action ?? (req.method === 'GET' ? 'get' : 'update')

    if (action === 'get') {
      const workspaceId = body.workspaceId ?? new URL(req.url).searchParams.get('workspaceId')

      let query = supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)

      if (workspaceId) {
        query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`)
      }

      const { data, error } = await query.order('workspace_id', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()

      if (error) throw error

      const row = data as Record<string, unknown> | null
      const prefs = row ? {
        id: row.id,
        userId: row.user_id,
        workspaceId: row.workspace_id,
        channels: row.channels ?? { inApp: true, email: true, sms: false },
        frequency: row.frequency ?? 'immediate',
        quietHoursStart: row.quiet_hours_start,
        quietHoursEnd: row.quiet_hours_end,
        mutedUntil: row.muted_until,
        globalMute: row.global_mute ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } : {
        channels: { inApp: true, email: true, sms: false },
        frequency: 'immediate' as const,
        quietHoursStart: null as string | null,
        quietHoursEnd: null as string | null,
        mutedUntil: null as string | null,
        globalMute: false,
      }

      return new Response(
        JSON.stringify(prefs),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update') {
      const updateBody = body as {
        workspaceId?: string
        channels?: { inApp?: boolean; email?: boolean; sms?: boolean }
        frequency?: 'immediate' | 'digest'
        quietHoursStart?: string
        quietHoursEnd?: string
        globalMute?: boolean
      }

      const workspaceId = updateBody.workspaceId ?? null

      let existingQuery = supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
      if (workspaceId) {
        existingQuery = existingQuery.eq('workspace_id', workspaceId)
      } else {
        existingQuery = existingQuery.is('workspace_id', null)
      }
      const { data: existing } = await existingQuery.maybeSingle()

      const row = {
        user_id: userId,
        workspace_id: workspaceId,
        channels: updateBody.channels ?? { inApp: true, email: true, sms: false },
        frequency: updateBody.frequency ?? 'immediate',
        quiet_hours_start: updateBody.quietHoursStart ?? null,
        quiet_hours_end: updateBody.quietHoursEnd ?? null,
        global_mute: updateBody.globalMute ?? false,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        const { data, error } = await supabase
          .from('notification_preferences')
          .update(row)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(row)
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
