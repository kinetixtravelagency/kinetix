ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'graduate';

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS payment_plan text NOT NULL DEFAULT 'installments',
  ADD COLUMN IF NOT EXISTS installments integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deposit_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS stage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS education text;

CREATE TABLE public.application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_documents TO authenticated;
GRANT ALL ON public.application_documents TO service_role;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own documents" ON public.application_documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add own documents" ON public.application_documents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own pending documents" ON public.application_documents FOR DELETE TO authenticated USING (user_id = auth.uid() AND status <> 'approved');
CREATE POLICY "Admins manage documents" ON public.application_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Users upload own files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Users delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);