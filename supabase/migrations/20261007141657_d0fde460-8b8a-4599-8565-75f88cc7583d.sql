CREATE TABLE public.partner_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  min_leads integer NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  client_discount numeric(5,2) NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_levels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_levels TO authenticated;
GRANT ALL ON public.partner_levels TO service_role;
ALTER TABLE public.partner_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads levels" ON public.partner_levels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage levels" ON public.partner_levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  country_interest text,
  track text,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners manage own leads" ON public.leads FOR ALL TO authenticated
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS experience text;

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS discount_percent numeric(5,2) NOT NULL DEFAULT 0;

ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EGP',
  ADD COLUMN IF NOT EXISTS note text;