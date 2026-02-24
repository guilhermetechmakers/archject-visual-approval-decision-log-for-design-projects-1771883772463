/**
 * Session Management Edge Function
 * GET - List user sessions
 * DELETE /:sessionId - Revoke specific session
 * DELETE - Revoke all sessions except current (body: { exceptSessionId?: string })
 *
 * Requires: Authorization: Bearer <access_token>
 * Integrates with public.sessions and public.token_audit tables.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionRow {
  id: string
  user_id: string
  device_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_used_at: string
  is_revoked: boolean
  expires_at: string
}

function parseUserAgent(ua: string | null): { os?: string; browser?: string } {
  if (!ua) return {}
  const os = ua.includes('Mac') ? 'macOS' : ua.includes('Windows') ? 'Windows' : ua.includes('Linux') ? 'Linux' : ua.includes('iPhone') ? 'iOS' : ua.includes('Android') ? 'Android' : undefined
  const browser = ua.includes('Chrome') && !ua.includes('Edg') ? 'Chrome' : ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Edg') ? 'Edge' : undefined
  return { os, browser }
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

  const token = authHeader.replace('Bearer ', '')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ message: 'Invalid or expired token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const sessionId = pathParts[pathParts.length - 1] && pathParts[pathParts.length - 1] !== 'sessions' ? pathParts[pathParts.length - 1] : null

  if (req.method === 'GET') {
    try {
      const { data: rows, error } = await supabase
        .from('sessions')
        .select('id, user_id, device_id, ip_address, user_agent, created_at, last_used_at, is_revoked, expires_at')
        .eq('user_id', user.id)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())

      if (error) {
        console.error('sessions select error:', error)
        return new Response(
          JSON.stringify({ message: 'Failed to fetch sessions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''
      const userAgent = req.headers.get('user-agent') ?? ''

      const sessions = (rows ?? []).map((r: SessionRow) => {
        const { os, browser } = parseUserAgent(r.user_agent)
        const device = [os, browser].filter(Boolean).join(' on ') || 'Unknown device'
        return {
          id: r.id,
          device,
          location: r.ip_address ? `IP: ${r.ip_address}` : 'Unknown',
          lastUsed: r.last_used_at,
          current: r.ip_address === ip && r.user_agent === userAgent,
          os,
          browser,
          ipAddress: r.ip_address,
          userAgent: r.user_agent,
        }
      })

      return new Response(JSON.stringify(sessions), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('sessions GET error:', err)
      return new Response(
        JSON.stringify({ message: 'An error occurred' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  if (req.method === 'DELETE') {
    try {
      const supabaseAdmin = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null

      if (sessionId) {
        const { data: updated, error } = await supabaseAdmin
          .from('sessions')
          .update({ is_revoked: true })
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .select('id')
          .single()

        if (error || !updated) {
          return new Response(
            JSON.stringify({ message: 'Session not found or already revoked' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        await supabaseAdmin.from('token_audit').insert({
          user_id: user.id,
          action: 'session_revoke',
          target_session_id: sessionId,
          actor_type: 'user',
          actor_id: user.id,
          ip_address: ip,
        })
      } else {
        const reqUrl = new URL(req.url)
        let exceptId = reqUrl.searchParams.get('exceptSessionId') ?? null
        if (!exceptId) {
          try {
            const body = await req.json() as { exceptSessionId?: string }
            exceptId = body.exceptSessionId ?? null
          } catch {
            // No body
          }
        }

        const baseQuery = supabaseAdmin
          .from('sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_revoked', false)
        const { data: toRevoke } = exceptId
          ? await baseQuery.neq('id', exceptId)
          : await baseQuery

        const ids = (toRevoke ?? []).map((r: { id: string }) => r.id)
        if (ids.length > 0) {
          await supabaseAdmin
            .from('sessions')
            .update({ is_revoked: true })
            .in('id', ids)

          await supabaseAdmin.from('token_audit').insert({
            user_id: user.id,
            action: 'session_revoke_all',
            actor_type: 'user',
            actor_id: user.id,
            ip_address: ip,
            details: { revoked_count: ids.length, except_session_id: exceptId },
          })
        }
      }

      return new Response(null, { status: 204, headers: corsHeaders })
    } catch (err) {
      console.error('sessions DELETE error:', err)
      return new Response(
        JSON.stringify({ message: 'An error occurred' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
