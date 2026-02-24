/**
 * Branding Upload Asset - Supabase Edge Function
 * POST /branding/assets - Upload logo or favicon for workspace branding
 * Integrates with Supabase Storage; stores in branding-assets bucket
 * Required: assetType (logo|favicon), file (multipart)
 * Returns: { url: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET = 'branding-assets'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const assetType = formData.get('assetType') as string | null
    const file = formData.get('file') as File | null

    if (!assetType || !file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ message: 'assetType and file required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['logo', 'favicon'].includes(assetType)) {
      return new Response(
        JSON.stringify({ message: 'assetType must be logo or favicon' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ message: 'File must be under 5MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mime = file.type || 'application/octet-stream'
    if (!ALLOWED_MIME.includes(mime)) {
      return new Response(
        JSON.stringify({ message: 'Use PNG, JPG or SVG only' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ext = file.name.split('.').pop() ?? 'png'
    const storagePath = `workspaces/${user.id}/${assetType}-${crypto.randomUUID()}.${ext}`

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
        Deno.env.get('SUPABASE_ANON_KEY') ??
        ''
    )

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: false })

    if (uploadError) {
      return new Response(
        JSON.stringify({ message: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    return new Response(
      JSON.stringify({ url: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
