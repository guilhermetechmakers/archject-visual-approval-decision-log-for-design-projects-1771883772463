/**
 * Password Reset - Validate Token
 * POST /functions/v1/validate-reset-token
 * Body: { token }
 * Optional pre-flight check for UI to verify token state before showing reset form.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const token = (body.token ?? '').toString().trim()
    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, used: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenHash = await sha256(token)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: rows, error } = await supabase
      .from('password_reset_tokens')
      .select('expires_at, used_at')
      .eq('token_hash', tokenHash)
      .limit(1)

    if (error || !rows?.length) {
      return new Response(
        JSON.stringify({ valid: false, used: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const row = rows[0] as { expires_at: string; used_at: string | null }
    const used = !!row.used_at
    const expired = new Date(row.expires_at) < new Date()
    const valid = !used && !expired

    return new Response(
      JSON.stringify({
        valid,
        used,
        expires_at: row.expires_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ valid: false, used: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
