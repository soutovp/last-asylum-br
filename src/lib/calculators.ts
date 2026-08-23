/**
 * Constantes e funções de cálculo migradas do projeto lap original
 * Fonte: http://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/
 */

// ==========================================
// 1. ANTITOXINAS (NÍVEL DO HERÓI 1 AO 148)
// ==========================================
export const ANTITOXIN_COSTS: Record<number, number> = {
  2: 100, 3: 200, 4: 300, 5: 500, 6: 700, 7: 900, 8: 1100, 9: 1300, 10: 1500,
  11: 2100, 12: 2700, 13: 3300, 14: 3900, 15: 4700, 16: 5500, 17: 6300, 18: 7100, 19: 7900, 20: 8700,
  21: 9700, 22: 10700, 23: 11700, 24: 12700, 25: 13900, 26: 15100, 27: 16300, 28: 17500, 29: 18700, 30: 19900,
  31: 21900, 32: 23900, 33: 25900, 34: 27900, 35: 29900, 36: 31900, 37: 33900, 38: 35900, 39: 37900, 40: 39900,
  41: 41900, 42: 43900, 43: 45900, 44: 47900, 45: 137900, 46: 227900, 47: 317900, 48: 407900, 49: 497900, 50: 587900,
  51: 677900, 52: 767900, 53: 857900, 54: 947900, 55: 1050000, 56: 1150000, 57: 1250000, 58: 1350000, 59: 1450000, 60: 1550000,
  61: 1650000, 62: 1750000, 63: 1850000, 64: 1950000, 65: 2500000, 66: 3000000, 67: 3600000, 68: 4200000, 69: 4800000, 70: 5500000,
  71: 6000000, 72: 6700000, 73: 7200000, 74: 7800000, 75: 8400000, 76: 9100000, 77: 9700000, 78: 10200000, 79: 10900000, 80: 11800000,
  81: 12700000, 82: 13600000, 83: 14500000, 84: 15400000, 85: 16300000, 86: 17200000, 87: 18100000, 88: 19000000, 89: 19900000, 90: 20800000,
  91: 21700000, 92: 22600000, 93: 23500000, 94: 24400000, 95: 26100000, 96: 27800000, 97: 29500000, 98: 31200000, 99: 32900000, 100: 34600000,
  101: 36300000, 102: 38000000, 103: 39700000, 104: 41400000, 105: 43100000, 106: 44800000, 107: 46500000, 108: 48200000, 109: 49900000, 110: 51600000,
  111: 53300000, 112: 55000000, 113: 56700000, 114: 58400000, 115: 60700000, 116: 63000000, 117: 65300000, 118: 67600000, 119: 69900000, 120: 72200000,
  121: 74500000, 122: 76800000, 123: 79100000, 124: 81400000, 125: 83700000, 126: 86000000, 127: 88300000, 128: 90600000, 129: 92900000, 130: 96500000,
  131: 100100000, 132: 104000000, 133: 108000000, 134: 112000000, 135: 116000000, 136: 120000000, 137: 124000000, 138: 128000000, 139: 132000000, 140: 136000000,
  141: 140000000, 142: 144000000, 143: 148000000, 144: 152000000, 145: 156000000, 146: 160000000, 147: 164000000, 148: 168000000,
};

export interface AntitoxinResult {
  nivelAtual: number;
  nivelDesejado: number;
  totalAntitoxins: number;
  totalFormatado: string;
  erro?: string;
}

export function calcularAntitoxinTotal(nivelAtual: number, nivelDesejado: number): AntitoxinResult {
  if (isNaN(nivelAtual) || isNaN(nivelDesejado)) {
    return { nivelAtual, nivelDesejado, totalAntitoxins: 0, totalFormatado: "0", erro: "Informe números válidos." };
  }

  if (nivelAtual < 1 || nivelDesejado > 148) {
    return { nivelAtual, nivelDesejado, totalAntitoxins: 0, totalFormatado: "0", erro: "Nível atual deve ser ≥ 1 e desejado ≤ 148." };
  }

  if (nivelAtual >= nivelDesejado) {
    return { nivelAtual, nivelDesejado, totalAntitoxins: 0, totalFormatado: "0", erro: "Nível desejado deve ser maior que o atual." };
  }

  let totalAntitoxins = 0;
  for (let level = nivelAtual + 1; level <= nivelDesejado; level++) {
    if (ANTITOXIN_COSTS[level] !== undefined) {
      totalAntitoxins += ANTITOXIN_COSTS[level];
    }
  }

  return {
    nivelAtual,
    nivelDesejado,
    totalAntitoxins,
    totalFormatado: totalAntitoxins.toLocaleString("pt-BR"),
  };
}

// ==========================================
// 2. FRAGMENTOS DE HERÓI (ESTRELAS 0.2 AO 10.0)
// ==========================================
export const STAR_SHARDS_COSTS: Record<string, number> = {
  "0.2": 2, "0.4": 2, "0.6": 2, "0.8": 2, "1.0": 2,
  "1.2": 3, "1.4": 3, "1.6": 3, "1.8": 3, "2.0": 3,
  "2.2": 4, "2.4": 4, "2.6": 4, "2.8": 4, "3.0": 4,
  "3.2": 6, "3.4": 6, "3.6": 6, "3.8": 6, "4.0": 6,
  "4.2": 8, "4.4": 8, "4.6": 8, "4.8": 8, "5.0": 8,
  "5.2": 12, "5.4": 12, "5.6": 12, "5.8": 12, "6.0": 12,
  "6.2": 25, "6.4": 25, "6.6": 25, "6.8": 25, "7.0": 25,
  "7.2": 35, "7.4": 35, "7.6": 35, "7.8": 35, "8.0": 35,
  "8.2": 40, "8.4": 40, "8.6": 40, "8.8": 40, "9.0": 40,
  "9.2": 60, "9.4": 60, "9.6": 60, "9.8": 60, "10.0": 60,
};

export interface StarResult {
  estrelaAtual: number;
  estrelaDesejada: number;
  totalShards: number;
  totalFormatado: string;
  erro?: string;
}

export function calcularShardsTotal(estrelaAtual: number, estrelaDesejada: number): StarResult {
  if (isNaN(estrelaAtual) || isNaN(estrelaDesejada)) {
    return { estrelaAtual, estrelaDesejada, totalShards: 0, totalFormatado: "0", erro: "Informe valores numéricos válidos." };
  }

  const atualInt = Math.round(estrelaAtual * 5) * 2;
  const desejadaInt = Math.round(estrelaDesejada * 5) * 2;

  if (atualInt < 0 || desejadaInt > 100) {
    return { estrelaAtual, estrelaDesejada, totalShards: 0, totalFormatado: "0", erro: "Estrelas devem estar entre 0.0 e 10.0." };
  }

  if (atualInt >= desejadaInt) {
    return { estrelaAtual, estrelaDesejada, totalShards: 0, totalFormatado: "0", erro: "Estrela desejada deve ser maior que a atual." };
  }

  let totalShards = 0;
  for (let step = atualInt + 2; step <= desejadaInt; step += 2) {
    const starKey = (step / 10).toFixed(1);
    if (STAR_SHARDS_COSTS[starKey] !== undefined) {
      totalShards += STAR_SHARDS_COSTS[starKey];
    }
  }

  return {
    estrelaAtual: Number((atualInt / 10).toFixed(1)),
    estrelaDesejada: Number((desejadaInt / 10).toFixed(1)),
    totalShards,
    totalFormatado: totalShards.toLocaleString("pt-BR"),
  };
}

// ==========================================
// 3. HABILIDADES DE HERÓIS (BADGES NÍVEL 1 AO 22)
// ==========================================
export const SKILL_BADGES_COSTS: Record<number, number> = {
  2: 50, 3: 100, 4: 150, 5: 300, 6: 450, 7: 600, 8: 750, 9: 900, 10: 1200,
  11: 1500, 12: 1800, 13: 2100, 14: 2400, 15: 3100, 16: 3800, 17: 4500, 18: 5200,
  19: 5900, 20: 6900, 21: 7900, 22: 8900,
};

export interface SkillResult {
  nivelAtual: number;
  nivelDesejado: number;
  totalBadges: number;
  totalFormatado: string;
  erro?: string;
}

export function calcularSkillBadgesTotal(nivelAtual: number, nivelDesejado: number): SkillResult {
  if (isNaN(nivelAtual) || isNaN(nivelDesejado)) {
    return { nivelAtual, nivelDesejado, totalBadges: 0, totalFormatado: "0", erro: "Informe números válidos." };
  }

  if (nivelAtual < 1 || nivelDesejado > 22) {
    return { nivelAtual, nivelDesejado, totalBadges: 0, totalFormatado: "0", erro: "Nível atual ≥ 1 e desejado ≤ 22." };
  }

  if (nivelAtual >= nivelDesejado) {
    return { nivelAtual, nivelDesejado, totalBadges: 0, totalFormatado: "0", erro: "Nível desejado deve ser maior que o atual." };
  }

  let totalBadges = 0;
  for (let level = nivelAtual + 1; level <= nivelDesejado; level++) {
    if (SKILL_BADGES_COSTS[level] !== undefined) {
      totalBadges += SKILL_BADGES_COSTS[level];
    }
  }

  return {
    nivelAtual,
    nivelDesejado,
    totalBadges,
    totalFormatado: totalBadges.toLocaleString("pt-BR"),
  };
}
