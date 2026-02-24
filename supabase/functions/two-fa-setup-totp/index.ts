/**
 * 2FA Setup TOTP - Generate secret and QR code for authenticator apps
 * Returns: secret, otpauthUrl, qrCodeDataUrl
 * Requires: Authorization Bearer token
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TOTP, Secret } from 'https://esm.sh/otpauth@9.5.0'
import * as QRCode from 'https://esm.sh/qrcode@1.5.4'

function generateSecret(): string {
  const totp = new TOTP({ issuer: 'Archject', label: '2FA', algorithm: 'SHA1', digits: 6, period: 30 })
  return totp.secret.base32
}

function getOtpAuthUrl(secret: string, email: string): string {
  const totp = new TOTP({
    issuer: 'Archject',
    label: email,
    secret: Secret.fromBase32(secret),
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  })
  return totp.toString()
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    if (getUserError || !user?.id || !user?.email) {
      return new Response(JSON.stringify({ message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existing } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing?.is_enabled) {
      return new Response(JSON.stringify({ message: '2FA is already enabled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const secret = generateSecret()
    const otpauthUrl = getOtpAuthUrl(secret, user.email ?? 'user')

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })

    await supabaseAdmin.from('user_2fa_config').upsert(
      {
        user_id: user.id,
        is_enabled: false,
        method: 'totp',
        totp_secret: secret,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    return new Response(
      JSON.stringify({
        success: true,
        secret,
        otpauthUrl,
        qrCodeDataUrl,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('two-fa-setup-totp error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
