export type Level = {
  id: string;
  name: string;
  name_ar: string;
  min_leads: number;
  commission_rate: number;
  commission_amount: number; // Fixed commission per referred client in EGP
  client_discount: number;
  sort_order: number;
};

/**
 * Returns default fixed commission in EGP according to level tier:
 * - Starter (مبتدئ): 9,350 EGP
 * - Bronze (برونزي): 10,250 EGP
 * - Silver (فضي): 11,250 EGP
 * - Gold (ذهبي): 12,500 EGP
 * - Platinum (بلاتيني): 14,000 EGP
 */
export function defaultCommissionFor(levelName: string = "", minLeads: number = 0): number {
  const norm = (levelName || "").toLowerCase().trim();
  if (norm.includes("start") || minLeads === 0) return 9350;
  if (norm.includes("bronz") || minLeads <= 5) return 10250;
  if (norm.includes("silv") || minLeads <= 10) return 11250;
  if (norm.includes("gold") || minLeads <= 20) return 12500;
  if (norm.includes("plat") || minLeads >= 40) return 14000;
  return Math.round(9350 + minLeads * 115);
}

export function enrichLevel(level: any): Level {
  if (!level) return level;
  const commAmount =
    typeof level.commission_amount === "number" && level.commission_amount > 0
      ? Math.round(level.commission_amount)
      : defaultCommissionFor(level.name, level.min_leads ?? 0);

  return {
    ...level,
    commission_amount: commAmount,
  };
}

export function levelFor(levels: Level[], leads: number) {
  const sorted = [...levels].map(enrichLevel).sort((a, b) => a.min_leads - b.min_leads);
  let current = sorted[0];
  for (const l of sorted) if (leads >= l.min_leads) current = l;
  const next = sorted.find((l) => l.min_leads > leads);
  return { current, next };
}

export const egp = (n: number) => `${Math.round(n).toLocaleString("en-US")} EGP`;
