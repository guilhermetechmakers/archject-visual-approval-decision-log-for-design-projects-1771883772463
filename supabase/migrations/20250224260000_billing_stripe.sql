-- Payment & Billing - Stripe integration
-- Plans, Add-ons, Subscriptions, Invoices, Payment Methods, Usage Records
-- Requires: auth.users (Supabase Auth)

-- Subscription status enum
CREATE TYPE public.billing_subscription_status AS ENUM (
  'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired'
);

-- Invoice status enum
CREATE TYPE public.billing_invoice_status AS ENUM (
  'draft', 'open', 'paid', 'void', 'uncollectible', 'pending'
);

-- Billing plans (Stripe price mapping)
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- cents
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly')),
  features JSONB DEFAULT '[]',
  prorate_behavior TEXT DEFAULT 'create_prorations' CHECK (prorate_behavior IN ('create_prorations', 'none', 'always_invoice')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing add-ons
CREATE TABLE IF NOT EXISTS public.billing_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL CHECK (interval IN ('one_time', 'monthly', 'yearly')),
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing customers (links auth.users to Stripe)
CREATE TABLE IF NOT EXISTS public.billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  default_payment_method_id TEXT,
  billing_address JSONB,
  tax_exempt BOOLEAN NOT NULL DEFAULT false,
  metered_billing_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_customers_user_id ON public.billing_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe ON public.billing_customers(stripe_customer_id);

-- Payment methods (Stripe refs only - no card data)
CREATE TABLE IF NOT EXISTS public.billing_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_payment_methods_user ON public.billing_payment_methods(user_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.billing_plans(id) ON DELETE RESTRICT,
  status billing_subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  quantity INTEGER NOT NULL DEFAULT 1,
  addons JSONB DEFAULT '[]', -- [{addon_id, quantity}]
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user ON public.billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_stripe ON public.billing_subscriptions(stripe_subscription_id);

-- Invoices
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  amount_due INTEGER NOT NULL DEFAULT 0,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status billing_invoice_status NOT NULL DEFAULT 'pending',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_user ON public.billing_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe ON public.billing_invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_subscription ON public.billing_invoices(subscription_id);

-- Usage records (metered billing)
CREATE TABLE IF NOT EXISTS public.billing_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.billing_subscriptions(id) ON DELETE CASCADE,
  meter_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_usage_subscription ON public.billing_usage_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_usage_timestamp ON public.billing_usage_records(timestamp);

-- Billing audit log (refunds, plan changes, admin actions)
CREATE TABLE IF NOT EXISTS public.billing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_audit_user ON public.billing_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_audit_created ON public.billing_audit_log(created_at);

-- RLS
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_audit_log ENABLE ROW LEVEL SECURITY;

-- Plans and addons: read-only for all authenticated
CREATE POLICY "Plans readable by authenticated" ON public.billing_plans
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Addons readable by authenticated" ON public.billing_addons
  FOR SELECT TO authenticated USING (is_active = true);

-- Customers: own data only
CREATE POLICY "Customers own" ON public.billing_customers
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Payment methods: own data only
CREATE POLICY "Payment methods own" ON public.billing_payment_methods
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Subscriptions: own data only
CREATE POLICY "Subscriptions own" ON public.billing_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Invoices: own data only
CREATE POLICY "Invoices own" ON public.billing_invoices
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Usage records: via subscription ownership
CREATE POLICY "Usage via subscription" ON public.billing_usage_records
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.billing_subscriptions s
      WHERE s.id = subscription_id AND s.user_id = auth.uid()
    )
  );

-- Audit log: users see own; admins see all (admin check via admin_users)
CREATE POLICY "Audit own" ON public.billing_audit_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Seed default plans (for development / Stripe sync)
INSERT INTO public.billing_plans (stripe_price_id, name, description, price, currency, interval, features, prorate_behavior)
VALUES
  ('price_starter_monthly', 'Starter', 'For small teams', 2900, 'usd', 'monthly', '["5 projects", "50 decisions/month"]'::jsonb, 'create_prorations'),
  ('price_starter_yearly', 'Starter', 'For small teams (annual)', 29000, 'usd', 'yearly', '["5 projects", "50 decisions/month", "2 months free"]'::jsonb, 'create_prorations'),
  ('price_pro_monthly', 'Pro', 'For growing teams', 7900, 'usd', 'monthly', '["Unlimited projects", "500 decisions/month"]'::jsonb, 'create_prorations'),
  ('price_pro_yearly', 'Pro', 'For growing teams (annual)', 79000, 'usd', 'yearly', '["Unlimited projects", "500 decisions/month", "2 months free"]'::jsonb, 'create_prorations'),
  ('price_enterprise_monthly', 'Enterprise', 'For large organizations', 19900, 'usd', 'monthly', '["Unlimited everything", "Priority support", "SSO"]'::jsonb, 'create_prorations')
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Seed default add-ons
INSERT INTO public.billing_addons (stripe_price_id, name, description, price, currency, interval, features)
VALUES
  ('price_addon_extra_seat', 'Extra seat', 'Additional team member', 990, 'usd', 'monthly', '[]'::jsonb),
  ('price_addon_storage', 'Extra storage', '50GB additional storage', 1990, 'usd', 'monthly', '[]'::jsonb)
ON CONFLICT (stripe_price_id) DO NOTHING;
