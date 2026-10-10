import fs from "node:fs";
import path from "node:path";
import { type Level, defaultCommissionFor } from "./levels";

const CONFIG_FILE = path.resolve(process.cwd(), "data", "levels_config.json");

interface LevelsConfig {
  commissions: Record<string, number>; // levelId or levelName -> commission_amount
}

function loadConfig(): LevelsConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading levels_config.json:", e);
  }
  return { commissions: {} };
}

function saveConfig(cfg: LevelsConfig) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving levels_config.json:", e);
  }
}

export function saveServerLevelCommission(levelId: string, amount: number) {
  const cfg = loadConfig();
  cfg.commissions[levelId] = Math.round(amount);
  saveConfig(cfg);
}

export function enrichLevelsWithServerConfig(levels: any[]): Level[] {
  const cfg = loadConfig();
  return (levels ?? []).map((l) => {
    // Check if custom config exists for this level ID or name
    const custom = cfg.commissions[l.id] ?? cfg.commissions[l.name];
    const amount =
      typeof custom === "number" && custom > 0
        ? custom
        : typeof l.commission_amount === "number" && l.commission_amount > 0
        ? l.commission_amount
        : defaultCommissionFor(l.name, l.min_leads ?? 0);

    return {
      ...l,
      commission_amount: amount,
    };
  });
}
