-- Add commission_amount column to partner_levels (fixed commission in EGP)
ALTER TABLE public.partner_levels
  ADD COLUMN IF NOT EXISTS commission_amount INTEGER NOT NULL DEFAULT 9350;

-- Update existing levels with the new fixed commission progression:
-- Starter (0 leads): 9,350 EGP
UPDATE public.partner_levels
SET commission_amount = 9350
WHERE name = 'Starter' OR min_leads = 0;

-- Bronze (5 leads): 10,250 EGP
UPDATE public.partner_levels
SET commission_amount = 10250
WHERE name = 'Bronze' OR min_leads = 5;

-- Silver (10 leads): 11,250 EGP
UPDATE public.partner_levels
SET commission_amount = 11250
WHERE name = 'Silver' OR min_leads = 10;

-- Gold (20 leads): 12,500 EGP
UPDATE public.partner_levels
SET commission_amount = 12500
WHERE name = 'Gold' OR min_leads = 20;

-- Platinum (40 leads): 14,000 EGP
UPDATE public.partner_levels
SET commission_amount = 14000
WHERE name = 'Platinum' OR min_leads >= 40;
