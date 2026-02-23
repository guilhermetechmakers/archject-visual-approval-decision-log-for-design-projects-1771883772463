/**
 * Billing Invoice Download
 * GET /billing/invoice/:invoice_id/download
 * Query params: format (pdf | csv | json)
 * Returns PDF URL or download URL for the invoice receipt.
 * Integrates with Stripe Invoice PDF. Requires Supabase Auth.
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
    const pathParts = url.pathname.split('/')
    const invoiceId = pathParts[pathParts.length - 2]
    const format = url.searchParams.get('format') ?? 'pdf'

    if (!invoiceId || invoiceId === 'download') {
      return new Response(
        JSON.stringify({ message: 'Invoice ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Integrate with Stripe
    // - Verify user owns this invoice (RLS or query by user_id)
    // - For PDF: stripe.invoices.retrieveUpcoming or retrieve, then invoice_pdf
    // - Return hosted invoice URL or generate PDF
    // - Audit log the download

    const mockUrl = `/invoices/${invoiceId}.pdf`
    return new Response(
      JSON.stringify({
        url: mockUrl,
        download_url: mockUrl,
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
