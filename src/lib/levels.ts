export type Level = { id: string; name: string; name_ar: string; min_leads: number; commission_rate: number; client_discount: number; sort_order: number };

export function levelFor(levels: Level[], leads: number) {
  const sorted = [...levels].sort((a, b) => a.min_leads - b.min_leads);
  let current = sorted[0];
  for (const l of sorted) if (leads >= l.min_leads) current = l;
  const next = sorted.find((l) => l.min_leads > leads);
  return { current, next };
}

export const egp = (n: number) => `${Math.round(n).toLocaleString("en-US")} EGP`;
