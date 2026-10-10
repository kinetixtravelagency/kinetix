-- Extended program fields for full admin control over client-visible data
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS flight_price      integer    DEFAULT 0,         -- EUR, 0 = no flight option
  ADD COLUMN IF NOT EXISTS expected_salary   text       DEFAULT '',        -- e.g. "€700–€1,200 / month"
  ADD COLUMN IF NOT EXISTS expected_salary_ar text      DEFAULT '',
  ADD COLUMN IF NOT EXISTS working_hours     text       DEFAULT '',        -- e.g. "8 hrs/day · 5 days/week"
  ADD COLUMN IF NOT EXISTS accommodation     text       DEFAULT '',        -- EN
  ADD COLUMN IF NOT EXISTS accommodation_ar  text       DEFAULT '',        -- AR
  ADD COLUMN IF NOT EXISTS requirements      text[]     DEFAULT '{}',      -- EN list
  ADD COLUMN IF NOT EXISTS requirements_ar   text[]     DEFAULT '{}',      -- AR list
  ADD COLUMN IF NOT EXISTS duration_options  text[]     DEFAULT '{}';      -- e.g. ["3 months","4 months","5 months","6 months"]
