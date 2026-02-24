/**
 * 2FA Recovery Codes
 * GET: Generate and return recovery codes (one-time display) - requires 2FA enabled
 * POST: Regenerate recovery codes - invalidates old, returns new (one-time display)
 * Requires: Authorization Bearer token
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://esm.sh/bcryptjs@2.4.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RECOVERY_CODE_COUNT = 10
const RECOVERY_CODE_LENGTH = 10

function generateRecoveryCodes(): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codes: string[] = []
  const seen = new Set<string>()
  while (codes.length < RECOVERY_CODE_COUNT) {
    let code = ''
    for (let i = 0; i < RECOVERY_CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    if (!seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }
  return codes
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
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

    const { data: config } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    let isRegenerate = req.method === 'POST'
    if (req.method === 'POST') {
      try {
        const body = await req.json().catch(() => ({}))
        isRegenerate = body?.regenerate === true
      } catch {
        // default to get
      }
    }

    if (isRegenerate) {
      if (!config?.is_enabled) {
        return new Response(JSON.stringify({ message: '2FA must be enabled to regenerate recovery codes' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await supabaseAdmin.from('recovery_codes').delete().eq('user_id', user.id)
    } else {
      const { data: existingCodes } = await supabaseAdmin
        .from('recovery_codes')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (existingCodes && existingCodes.length > 0) {
        return new Response(
          JSON.stringify({
            message: 'Recovery codes were already shown. Use regenerate to get new codes.',
            codes: [],
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!config?.is_enabled) {
        return new Response(JSON.stringify({ message: '2FA must be enabled first' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const recoveryCodes = generateRecoveryCodes()
    const codeHashes = await Promise.all(recoveryCodes.map((c) => bcrypt.hash(c, 10)))

    for (const hash of codeHashes) {
      await supabaseAdmin.from('recovery_codes').insert({
        user_id: user.id,
        code_hash: hash,
      })
    }

    if (isRegenerate) {
      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: '2fa_recovery_codes_regenerated',
        details: { ip_address: ip, user_agent: req.headers.get('user-agent') || null },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        codes: recoveryCodes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('two-fa-recovery-codes error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
