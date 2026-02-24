/**
 * 2FA Audit Log - Fetch 2FA-related audit events for the user
 * POST with optional body { userId } - defaults to authenticated user
 * Returns: logs array
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TWO_FA_ACTIONS = ['2fa_enrolled_totp', '2fa_enrolled_sms', '2fa_disabled', '2fa_recovery_codes_regenerated']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ message: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !user?.id) {
      return new Response(JSON.stringify({ message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let requestedUserId: string | null = null
    if (req.method === 'POST') {
      try {
        const body = await req.json().catch(() => ({}))
        requestedUserId = typeof body?.userId === 'string' ? body.userId : null
      } catch {
        // ignore
      }
    } else {
      const url = new URL(req.url)
      requestedUserId = url.searchParams.get('userId')
    }
    const userId = requestedUserId && requestedUserId === user.id ? user.id : user.id

    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs')
      .select('id, action, details, timestamp')
      .eq('user_id', userId)
      .in('action', TWO_FA_ACTIONS)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) {
      console.error('two-fa-audit error:', error)
      return new Response(JSON.stringify({ message: 'Failed to fetch audit logs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        logs: (logs ?? []).map((l) => ({
          id: l.id,
          action: l.action,
          details: l.details,
          created_at: l.timestamp,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('two-fa-audit error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
