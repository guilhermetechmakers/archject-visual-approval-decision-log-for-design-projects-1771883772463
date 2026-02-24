/**
 * Webhook Test - Send test payload to webhook endpoint
 * POST body: { webhookId }
 * Sends sample Zapier-compatible payload with HMAC-SHA256 signature
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hmacSha256Base64(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )
  const bytes = new Uint8Array(sig)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: { webhookId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const webhookId = body.webhookId
  if (!webhookId) {
    return new Response(
      JSON.stringify({ success: false, message: 'webhookId required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: webhook, error: fetchErr } = await supabase
    .from('webhook_endpoints')
    .select('id, url, signing_secret, project_id')
    .eq('id', webhookId)
    .single()

  if (fetchErr || !webhook) {
    return new Response(
      JSON.stringify({ success: false, message: 'Webhook not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const testPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'Test payload from Archject',
      webhook_id: webhook.id,
      project_id: webhook.project_id,
    },
  }

  const payloadStr = JSON.stringify(testPayload)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Archject-Event': 'webhook.test',
  }

  if (webhook.signing_secret && webhook.signing_secret.length >= 32) {
    const signature = await hmacSha256Base64(webhook.signing_secret, payloadStr)
    headers['X-Archject-Signature'] = signature
  }

  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadStr,
    })

    await supabase
      .from('webhook_endpoints')
      .update({
        last_test_at: new Date().toISOString(),
        last_test_status: res.ok ? 'success' : 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)

    await supabase.from('webhook_audit_log').insert({
      webhook_id: webhookId,
      event: 'webhook.test',
      status_code: res.status,
      success: res.ok,
      attempt: 1,
    })

    return new Response(
      JSON.stringify({
        success: res.ok,
        status_code: res.status,
        message: res.ok ? 'Test payload delivered' : `HTTP ${res.status}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    await supabase
      .from('webhook_endpoints')
      .update({
        last_test_at: new Date().toISOString(),
        last_test_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)

    await supabase.from('webhook_audit_log').insert({
      webhook_id: webhookId,
      event: 'webhook.test',
      success: false,
      error_message: err instanceof Error ? err.message : 'Unknown error',
      attempt: 1,
    })

    return new Response(
      JSON.stringify({
        success: false,
        message: err instanceof Error ? err.message : 'Delivery failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
