/**
 * Billing History - Transaction / Order History
 * GET /billing/history
 * Query params: start_date, end_date, types, query, page, page_size, sort_by, sort_order, currency
 * Returns list of history items (invoices, payments, refunds, etc.) for the authenticated user.
 * Integrates with Stripe for invoice/payment data. Requires Supabase Auth.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const typesParam = url.searchParams.get('types')
    const types = typesParam ? typesParam.split(',').filter(Boolean) : []
    const query = url.searchParams.get('query') ?? ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, Math.max(10, parseInt(url.searchParams.get('page_size') ?? '20', 10)))
    const sortBy = url.searchParams.get('sort_by') ?? 'date'
    const sortOrder = url.searchParams.get('sort_order') ?? 'desc'

    // TODO: Integrate with Supabase DB and Stripe
    // - Query invoices, payments, refunds from DB (filtered by user_id from JWT)
    // - Map Stripe webhook data to BillingHistoryItem format
    // - Apply filters: start_date, end_date, types, query
    // - Sort and paginate

    const mockItems = [
      {
        id: 'hist_1',
        type: 'payment',
        date: new Date().toISOString(),
        amount: 29,
        currency: 'USD',
        status: 'paid',
        invoice_id: 'inv_1',
        receipt_id: 'rcpt_1',
        subscription_id: 'sub_123',
        description: 'Starter plan - Monthly',
        downloadable_receipt_url: null,
        payment_method: 'card',
        last4: '4242',
        account_balance: 0,
      },
    ]

    const total = mockItems.length
    const startIdx = (page - 1) * pageSize
    const items = mockItems.slice(startIdx, startIdx + pageSize)

    return new Response(
      JSON.stringify({
        items,
        total,
        page,
        page_size: pageSize,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
