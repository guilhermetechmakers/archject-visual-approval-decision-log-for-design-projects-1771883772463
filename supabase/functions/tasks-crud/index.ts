/**
 * Tasks CRUD - Light tasking engine
 * GET /tasks?projectId=&decisionId=&status=
 * POST /tasks - create
 * PUT /tasks/:id - update
 * DELETE /tasks/:id - delete
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

  const url = new URL(req.url)
  const pathParts = url.pathname.replace(/^\/tasks\/?/, '').split('/').filter(Boolean)
  const taskId = pathParts[0]

  if (req.method === 'GET') {
    const projectId = url.searchParams.get('projectId')
    const decisionId = url.searchParams.get('decisionId')
    const status = url.searchParams.get('status')

    if (!projectId) {
      return new Response(
        JSON.stringify({ success: false, message: 'projectId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: decisions } = await supabase
      .from('decisions')
      .select('id')
      .eq('project_id', projectId)
    const decisionIds = (decisions ?? []).map((d: { id: string }) => d.id)

    if (decisionIds.length === 0) {
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let query = supabase
      .from('tasks')
      .select('id, decision_id, assignee_id, due_date, status, priority, notes, created_at, updated_at')
      .in('decision_id', decisionIds)
    if (decisionId) query = query.eq('decision_id', decisionId)
    if (status) query = query.eq('status', status)

    const { data: tasks, error } = await query.order('updated_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userIds = [...new Set((tasks ?? []).map((t: { assignee_id?: string }) => t.assignee_id).filter(Boolean))]
    const profileMap = new Map<string, string>()
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      ;((profiles ?? []) as { id: string; full_name?: string }[]).forEach((p) =>
        profileMap.set(p.id, p.full_name ?? 'Unknown')
      )
    }

    const result = (tasks ?? []).map((t: Record<string, unknown>) => ({
      id: t.id,
      project_id: projectId,
      decision_id: t.decision_id,
      related_decision_id: t.decision_id,
      description: t.notes ?? '',
      notes: t.notes,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      due_at: t.due_date,
      assignee_id: t.assignee_id,
      assignee_name: t.assignee_id ? profileMap.get(t.assignee_id as string) ?? null : null,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }))

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'POST' && !taskId) {
    let body: { decision_id: string; assignee_id?: string; due_date?: string; status?: string; priority?: string; notes?: string }
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { decision_id, assignee_id, due_date, status, priority, notes } = body
    if (!decision_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'decision_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        decision_id,
        assignee_id: assignee_id || null,
        due_date: due_date || null,
        status: status || 'pending',
        priority: priority || 'med',
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(task), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'PUT' && taskId) {
    let body: { assignee_id?: string; due_date?: string; status?: string; priority?: string; notes?: string }
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: task } = await supabase.from('tasks').select().eq('id', taskId).single()
    return new Response(JSON.stringify(task ?? {}), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'DELETE' && taskId) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
