CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'customer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  flag TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL, name_ar TEXT NOT NULL DEFAULT '',
  tagline_en TEXT NOT NULL DEFAULT '', tagline_ar TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '', description_ar TEXT NOT NULL DEFAULT '',
  documents_en TEXT[] NOT NULL DEFAULT '{}',
  eligibility_en TEXT[] NOT NULL DEFAULT '{}',
  timeline_en JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.countries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published countries" ON public.countries FOR SELECT TO anon USING (published);
CREATE POLICY "Admins manage countries" ON public.countries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL, title_ar TEXT NOT NULL DEFAULT '',
  category_en TEXT NOT NULL DEFAULT '', category_ar TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  price INT NOT NULL DEFAULT 0,
  deposit INT NOT NULL DEFAULT 0,
  max_installments INT NOT NULL DEFAULT 3,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published programs" ON public.programs FOR SELECT TO anon USING (published);
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  promo_code TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'bronze',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  payout_method TEXT,
  payout_details TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners read own record" ON public.partners FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Partners update own payout" ON public.partners FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage partners" ON public.partners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id),
  partner_id UUID REFERENCES public.partners(id),
  status TEXT NOT NULL DEFAULT 'submitted',
  promo_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own applications" ON public.applications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Partners read referred applications" ON public.applications FOR SELECT TO authenticated USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage applications" ON public.applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  amount INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners read own commissions" ON public.commissions FOR SELECT TO authenticated USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage commissions" ON public.commissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.countries (slug, flag, image_key, name_en, name_ar, tagline_en, tagline_ar, description_en, description_ar, documents_en, eligibility_en, timeline_en, sort_order) VALUES
('bulgaria', '🇧🇬', 'bulgaria', 'Bulgaria', 'بلغاريا', 'Seasonal hospitality on the Black Sea coast', 'عمل موسمي في الضيافة على ساحل البحر الأسود', 'Hotels and resorts along the coast hire international staff every season, with accommodation support and a clear path from application to arrival.', 'توظّف الفنادق والمنتجعات على الساحل موظفين دوليين كل موسم، مع دعم للسكن ومسار واضح من التقديم حتى الوصول.', ARRAY['Valid passport (12+ months)','Recent passport photo','CV in English','Medical certificate','Police clearance'], ARRAY['Age 18–45','Basic English','No prior EU visa refusals'], '[{"step":"Application review","time":"3–5 days"},{"step":"Employer matching","time":"1–3 weeks"},{"step":"Work permit","time":"4–8 weeks"},{"step":"Visa & travel","time":"2–4 weeks"}]', 1),
('luxembourg', '🇱🇺', 'luxembourg', 'Luxembourg', 'لوكسمبورغ', 'Professional roles in Europe''s finance capital', 'وظائف مهنية في عاصمة المال الأوروبية', 'Skilled positions in logistics, services and business support in one of Europe''s highest-paying labour markets.', 'وظائف ماهرة في الخدمات اللوجستية والخدمات ودعم الأعمال في واحدة من أعلى أسواق العمل أجراً في أوروبا.', ARRAY['Valid passport (12+ months)','Recent passport photo','CV in English','Medical certificate','Police clearance','Diplomas & certificates'], ARRAY['Age 21–45','Intermediate English or French','Relevant work experience'], '[{"step":"Profile assessment","time":"1 week"},{"step":"Interviews","time":"2–4 weeks"},{"step":"Permit processing","time":"6–10 weeks"},{"step":"Relocation","time":"2–3 weeks"}]', 2),
('armenia', '🇦🇲', 'armenia', 'Armenia', 'أرمينيا', 'Fast-track work opportunities in Yerevan', 'فرص عمل سريعة في يريفان', 'A growing economy with accessible visa procedures and roles in services, construction and tech support.', 'اقتصاد نامٍ بإجراءات تأشيرة سهلة ووظائف في الخدمات والبناء والدعم التقني.', ARRAY['Valid passport (12+ months)','Recent passport photo','CV in English','Medical certificate'], ARRAY['Age 18–50','Basic English or Russian'], '[{"step":"Application review","time":"2–3 days"},{"step":"Job offer","time":"1–2 weeks"},{"step":"Visa & travel","time":"2–3 weeks"}]', 3),
('russia', '🇷🇺', 'russia', 'Russia', 'روسيا', 'Work and study programs in major cities', 'برامج عمل ودراسة في المدن الكبرى', 'Programs in Moscow and other major cities across manufacturing, services and university pathways.', 'برامج في موسكو ومدن كبرى أخرى في التصنيع والخدمات والمسارات الجامعية.', ARRAY['Valid passport (12+ months)','Recent passport photo','CV in English','Medical certificate','Police clearance'], ARRAY['Age 18–40','Basic Russian is a plus'], '[{"step":"Application review","time":"3–5 days"},{"step":"Invitation letter","time":"3–5 weeks"},{"step":"Visa & travel","time":"2–3 weeks"}]', 4),
('italy', '🇮🇹', 'italy', 'Italy', 'إيطاليا', 'Hospitality and culinary careers', 'مسارات مهنية في الضيافة وفنون الطهي', 'Kitchens, restaurants and agriculture across Italy recruit international talent through official quota programs.', 'توظّف المطابخ والمطاعم والزراعة في إيطاليا مواهب دولية عبر برامج الحصص الرسمية.', ARRAY['Valid passport (12+ months)','Recent passport photo','CV in English','Medical certificate','Police clearance','Experience letters'], ARRAY['Age 20–45','Hospitality experience preferred'], '[{"step":"Profile assessment","time":"1 week"},{"step":"Employer matching","time":"2–6 weeks"},{"step":"Nulla osta","time":"6–12 weeks"},{"step":"Visa & travel","time":"3–4 weeks"}]', 5);

INSERT INTO public.programs (country_id, slug, title_en, title_ar, category_en, category_ar, duration, price, deposit, max_installments)
SELECT c.id, v.slug, v.title_en, v.title_ar, v.cat_en, v.cat_ar, v.dur, v.price, v.dep, v.inst FROM (VALUES
('bulgaria','bulgaria-seasonal','Seasonal Work','عمل موسمي','Hospitality','ضيافة','4–6 months',1450,300,3),
('bulgaria','bulgaria-hotel','Hotel Operations','عمليات الفنادق','Hospitality','ضيافة','12 months',1850,400,4),
('luxembourg','luxembourg-skilled','Skilled Work','عمل ماهر','Professional','مهني','24 months',3200,700,6),
('armenia','armenia-work','General Work','عمل عام','Services','خدمات','12 months',950,200,3),
('russia','russia-work','Work Program','برنامج عمل','Industry','صناعة','12 months',1250,250,4),
('russia','russia-study','Study Pathway','مسار دراسي','Education','تعليم','1 academic year',1650,350,4),
('italy','italy-hospitality','Hospitality & Culinary','الضيافة وفنون الطهي','Hospitality','ضيافة','9 months',2850,600,6)
) AS v(cslug, slug, title_en, title_ar, cat_en, cat_ar, dur, price, dep, inst)
JOIN public.countries c ON c.slug = v.cslug;