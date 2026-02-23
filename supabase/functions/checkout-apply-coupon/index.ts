/**
 * Checkout - Apply Coupon
 * POST /checkout/apply-coupon
 * Validates promo code and returns discount details.
 * Body: { couponCode, planId?, addonIds?, seats? }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MOCK_COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number }> = {
  WELCOME10: { type: 'percent', value: 10 },
  SAVE20: { type: 'fixed', value: 20 },
  TRIAL50: { type: 'percent', value: 50 },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { couponCode, planId, addonIds } = body

    if (!couponCode) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Coupon code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const code = String(couponCode).trim().toUpperCase()
    const coupon = MOCK_COUPONS[code]
    if (!coupon) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid or expired coupon code',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const baseAmount = 100
    const discountAmount =
      coupon.type === 'percent' ? (baseAmount * coupon.value) / 100 : coupon.value
    const newTotal = Math.max(0, baseAmount - discountAmount)

    return new Response(
      JSON.stringify({
        valid: true,
        newTotal,
        discountDetails: {
          code,
          type: coupon.type,
          value: coupon.value,
          amount: discountAmount,
        },
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
