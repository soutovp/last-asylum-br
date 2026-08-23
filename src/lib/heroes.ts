/**
 * Last Asylum BR - Funções de Consulta, Negócio, Persistência e Formatação de Heróis
 * Last Asylum Plague / LAP
 *
 * Idioma: Português do Brasil (pt-BR)
 * Data de Atualização: 2026-08-23
 */

import {
  HEROES_DATA,
  Hero,
  HeroFaction,
  HeroRole,
  HeroRarity,
  HeroDamageType,
  HeroPosition,
  HeroAvailabilityFilter,
  HeroSkill,
  HeroCombatProfile,
  HeroUnlockInfo,
  HeroCalculatorLinks,
  SkillProgressionStep,
  SkillType,
} from "../data/heroes";
import { isSupabaseConfigured } from "./supabase";

// Chaves de armazenamento LocalStorage
export const HEROES_STORAGE_KEY = "admin_heroes_data";
export const HEROES_SETTINGS_STORAGE_KEY = "admin_heroes_server_settings";

// Re-exportar tipos fundamentais e dados brutos
export { HEROES_DATA };
export type {
  Hero,
  HeroFaction,
  HeroRole,
  HeroRarity,
  HeroDamageType,
  HeroPosition,
  HeroAvailabilityFilter,
  HeroSkill,
  HeroCombatProfile,
  HeroUnlockInfo,
  HeroCalculatorLinks,
  SkillProgressionStep,
  SkillType,
};

export interface HeroFilterOptions {
  search?: string;
  faction?: string;
  role?: string;
  rarity?: string;
  damageType?: string;
  serverAge?: number;
  availability?: HeroAvailabilityFilter;
  tag?: string;
}

export interface ServerAgeStatus {
  isAvailable: boolean;
  unlockDay: number;
  statusText: string;
  daysLeft: number;
}

export interface NextHeroUnlock {
  nextHero: Hero;
  daysLeft: number;
}

export interface HeroServerSettings {
  defaultServerAge: number;
  currentServerDay: number;
  autoRotate: boolean;
  rotationCycleDays: number;
  announcement?: string;
  lastUpdated?: string;
}

export const DEFAULT_HERO_SERVER_SETTINGS: HeroServerSettings = {
  defaultServerAge: 36,
  currentServerDay: 36,
  autoRotate: false,
  rotationCycleDays: 7,
  announcement: "Cronograma oficial de rotação e liberação de heróis do Last Asylum BR.",
  lastUpdated: new Date().toISOString(),
};

export interface CategorizedHero extends Hero {
  status: ServerAgeStatus;
}

export interface HeroesCategorizationResult {
  available: CategorizedHero[];
  upcoming: CategorizedHero[];
  nextUnlock: { hero: Hero; daysLeft: number } | null;
  currentServerDay: number;
  totalCount: number;
  availableCount: number;
  upcomingCount: number;
}

export interface HeroValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: Hero;
}

// =========================================================================
// SANITIZAÇÃO E VALIDAÇÃO DE DADOS
// =========================================================================

/**
 * Sanitiza e normaliza uma string removendo tags HTML e limitando o tamanho para evitar XSS e buffer overflow.
 */
export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "") // Remove tags HTML/XML
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "") // Remove caracteres de controle
    .trim()
    .slice(0, maxLength);
}

/**
 * Valida e sanitiza URLs permitindo apenas protocolos seguros (http, https, caminhos relativos e base64 de imagem).
 * Bloqueia expressamente javascript:, vbscript:, data:text/html e outros vetores maliciosos de XSS/Open-Redirect.
 */
export function sanitizeUrl(url: unknown, defaultUrl: string = ""): string {
  if (typeof url !== "string") return defaultUrl;
  const trimmed = url.trim();
  if (!trimmed) return defaultUrl;

  // Bloqueia expressamente protocolos perigosos
  if (/^(javascript|vbscript|data(?!\s*:\s*image\/)):/i.test(trimmed)) {
    return defaultUrl;
  }

  // Permite caminhos relativos internos seguros (/herois/..., /calculadoras...)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed.slice(0, 1000);
  }

  // Permite URLs absolutas HTTP/HTTPS válidas
  if (/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
    return trimmed.slice(0, 1000);
  }

  // Permite imagens Data URI WebP, PNG, JPEG, GIF seguras
  if (/^data:image\/(webp|png|jpeg|jpg|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  return defaultUrl;
}

/**
 * Sanitiza arrays de strings garantindo limites de quantidade e comprimento por item.
 */
export function sanitizeStringArray(
  arr: unknown,
  maxItemLength: number = 200,
  maxItems: number = 50
): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeText(item, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Sanitiza e normaliza uma string para se tornar um slug URL seguro.
 */
export function sanitizeSlug(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Converte caracteres especiais em hífen
    .replace(/^-+|-+$/g, "") // Remove hífens no início e fim
    .slice(0, 80); // Limite de 80 caracteres
}

/**
 * Cria a estrutura padrão de 3 habilidades completas com progressão de estrelas para novos heróis.
 */
export function createDefaultSkillsTemplate(
  heroId: string,
  damageType: HeroDamageType = "Physical"
): HeroSkill[] {
  const safeId = sanitizeSlug(heroId) || "novo-heroi";
  return [
    {
      id: `${safeId}-ult`,
      name: "Habilidade Suprema (Ultimate)",
      type: "Ultimate",
      cooldown: "16s",
      energyCost: 1000,
      damageType,
      description: "Libera o poder supremo causando dano massivo em área a todos os inimigos.",
      progression: [
        { starLevel: "2★", starsRequired: 2, title: "Impacto Fortalecido", description: "Dano base aumentado em +25%." },
        { starLevel: "4★", starsRequired: 4, title: "Duração Aumentada", description: "Efeitos residuais duram +2 segundos adicionais." },
        { starLevel: "6★ (🔴1)", starsRequired: 6, title: "Golpe Crítico", description: "Aumenta chance de crítico em alvos afetados." },
        { starLevel: "8★ (🔴3)", starsRequired: 8, title: "Aceleração de Energia", description: "Reduz o tempo de recarga da Ultimate em 3s." },
        { starLevel: "10★ (🔴5)", starsRequired: 10, title: "Poder Máximo", description: "Amplifica o dano total causado pela equipe em +30%." },
      ],
    },
    {
      id: `${safeId}-active`,
      name: "Habilidade Tática Ativa",
      type: "Ativa",
      cooldown: "10s",
      damageType,
      description: "Desfere ataque tático coordenado contra alvos na linha de frente.",
      progression: [
        { starLevel: "2★", starsRequired: 2, title: "Alcance Expandido", description: "Atinge alvos adjacentes ao alvo principal." },
        { starLevel: "4★", starsRequired: 4, title: "Penetração de Defesa", description: "Reduz a defesa do alvo em 20% por 5 segundos." },
        { starLevel: "6★ (🔴1)", starsRequired: 6, title: "Controle de Grupo", description: "Aplica lentidão ou atordoamento leve ao impactar." },
        { starLevel: "8★ (🔴3)", starsRequired: 8, title: "Recarga Rápida", description: "Reduz o tempo de recarga da habilidade em 2s." },
        { starLevel: "10★ (🔴5)", starsRequired: 10, title: "Golpe Devastador", description: "Causa dano adicional proporcional à vida perdida do alvo." },
      ],
    },
    {
      id: `${safeId}-passive`,
      name: "Aura Passiva de Combate",
      type: "Passiva",
      damageType: "None",
      description: "Aumenta os atributos gerais dos companheiros de equipe em combate.",
      progression: [
        { starLevel: "2★", starsRequired: 2, title: "Presença Heroica", description: "Bônus passivo de atributos aumentado para +15%." },
        { starLevel: "4★", starsRequired: 4, title: "Resiliência", description: "Aumenta a resistência a danos recebidos em combate." },
        { starLevel: "6★ (🔴1)", starsRequired: 6, title: "Inspiração", description: "Acelera a taxa de recuperação de energia da equipe." },
        { starLevel: "8★ (🔴3)", starsRequired: 8, title: "Tenacidade", description: "Reduz o tempo de efeitos negativos sofridos em 25%." },
        { starLevel: "10★ (🔴5)", starsRequired: 10, title: "Legado Heroico", description: "Concede bônus persistente mesmo após ser abatido." },
      ],
    },
  ];
}

/**
 * Cria um objeto Hero completo com templates e valores seguros para cadastro.
 */
export function createDefaultHeroTemplate(overrides?: Partial<Hero>): Hero {
  const defaultSlug = "novo-heroi";
  return {
    id: "novo-heroi",
    name: "Novo Herói",
    slug: defaultSlug,
    title: "O Estrategista da Praga",
    rarity: "UR",
    faction: "Warrior",
    role: "Carry",
    damageType: "Physical",
    avatarUrl: "",
    fullImageUrl: "",
    bannerUrl: "",
    bio: "Herói especializado em combate tático durante o apocalipse.",
    lore: "História de sobrevivência e domínio das táticas do Asilo.",
    quote: "A vitória favorece os mais preparados.",
    tier: "S",
    combatProfile: {
      tags: ["DPS", "Frontline", "Physical"],
      position: "Frontline",
      pros: ["Alto dano contínuo", "Boa durabilidade em combates táticos"],
      cons: ["Requer suporte de proteção"],
      synergyWith: [],
      counteredBy: [],
      bestFormation: "Posicionado na vanguarda para abrir espaço para a retaguarda.",
      recommendedPositioningNote: "Mantenha posicionado na linha frontal.",
    },
    unlockInfo: {
      serverDay: 1,
      methods: ["Recrutamento da Taberna", "Eventos Especiais"],
      laterMethods: ["Loja de Fragmentos"],
      notes: "Disponível a partir do dia 1 de abertura do servidor.",
      isAvailableDay1: true,
    },
    skills: createDefaultSkillsTemplate("novo-heroi", "Physical"),
    calculatorLinks: {
      antitoxinUrl: `/calculadoras?tab=antitoxin&hero=${defaultSlug}`,
      shardsUrl: `/calculadoras?tab=shards&hero=${defaultSlug}`,
      badgesUrl: `/calculadoras?tab=badges&hero=${defaultSlug}`,
    },
    sourceUrls: [`https://lastasylumplague.com/heroes/${defaultSlug}`],
    lastVerifiedAt: new Date().toISOString().slice(0, 10),
    ...overrides,
  };
}

/**
 * Valida os dados de um herói garantindo tipos estritos, sanitização profunda e preenchimento correto.
 */
export function validateHero(hero: Partial<Hero>): HeroValidationResult {
  const errors: string[] = [];

  const rawName = sanitizeText(hero.name, 100);
  if (!rawName) {
    errors.push("O nome do herói é obrigatório e deve conter caracteres válidos.");
  }

  const rawSlug = hero.slug || rawName || "";
  const slug = sanitizeSlug(rawSlug);
  if (!slug) {
    errors.push("O slug amigável do herói é obrigatório e inválido.");
  }

  const validRarities: HeroRarity[] = ["UR", "SSR"];
  if (!hero.rarity || !validRarities.includes(hero.rarity as HeroRarity)) {
    errors.push("A raridade deve ser 'UR' ou 'SSR'.");
  }

  const validFactions: HeroFaction[] = ["Warrior", "Ranger", "Warlock"];
  if (!hero.faction || !validFactions.includes(hero.faction as HeroFaction)) {
    errors.push("A facção deve ser 'Warrior', 'Ranger' ou 'Warlock'.");
  }

  const validRoles: HeroRole[] = ["Carry", "Tank", "Support"];
  if (!hero.role || !validRoles.includes(hero.role as HeroRole)) {
    errors.push("A função deve ser 'Carry', 'Tank' ou 'Support'.");
  }

  const validDamageTypes: HeroDamageType[] = ["Physical", "Energy", "Mixed"];
  if (!hero.damageType || !validDamageTypes.includes(hero.damageType as HeroDamageType)) {
    errors.push("O tipo de dano deve ser 'Physical', 'Energy' ou 'Mixed'.");
  }

  const parsedServerDay = Number(hero.unlockInfo?.serverDay ?? 1);
  const serverDay = Math.min(3650, Math.max(1, isNaN(parsedServerDay) ? 1 : Math.floor(parsedServerDay)));

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const heroId = sanitizeSlug(hero.id && hero.id.trim() ? hero.id.trim() : slug) || slug;

  const validTiers: Array<NonNullable<Hero["tier"]>> = ["S+", "S", "A+", "A", "B"];
  const sanitizedTier: Hero["tier"] =
    hero.tier && validTiers.includes(hero.tier.trim() as any)
      ? (hero.tier.trim() as NonNullable<Hero["tier"]>)
      : "S";

  const sanitizedAvatar = sanitizeUrl(hero.avatarUrl, "/images/heroes/placeholder.webp");
  const sanitizedFullImage = sanitizeUrl(hero.fullImageUrl, sanitizedAvatar);
  const sanitizedBanner = sanitizeUrl(hero.bannerUrl, "");

  const sanitized: Hero = {
    id: heroId,
    name: rawName,
    slug,
    title: sanitizeText(hero.title, 150) || `O Herói de ${hero.faction}`,
    rarity: hero.rarity as HeroRarity,
    faction: hero.faction as HeroFaction,
    role: hero.role as HeroRole,
    damageType: hero.damageType as HeroDamageType,
    avatarUrl: sanitizedAvatar,
    fullImageUrl: sanitizedFullImage,
    bannerUrl: sanitizedBanner,
    bio: sanitizeText(hero.bio, 2000) || `Guia estratégico e dados de combate de ${rawName}.`,
    lore: sanitizeText(hero.lore, 5000),
    quote: sanitizeText(hero.quote, 300),
    tier: sanitizedTier,
    combatProfile: {
      tags: Array.isArray(hero.combatProfile?.tags) && hero.combatProfile!.tags.length > 0
        ? sanitizeStringArray(hero.combatProfile!.tags, 40, 20)
        : [hero.role as string, hero.faction as string],
      position: (["Frontline", "Backline", "Flexible"].includes(hero.combatProfile?.position as any)
        ? hero.combatProfile!.position
        : hero.role === "Tank" ? "Frontline" : "Backline") as HeroPosition,
      pros: Array.isArray(hero.combatProfile?.pros) && hero.combatProfile!.pros.length > 0
        ? sanitizeStringArray(hero.combatProfile!.pros, 200, 10)
        : ["Alto potencial em composições dedicadas"],
      cons: Array.isArray(hero.combatProfile?.cons) && hero.combatProfile!.cons.length > 0
        ? sanitizeStringArray(hero.combatProfile!.cons, 200, 10)
        : ["Requer posicionamento cuidadoso"],
      synergyWith: Array.isArray(hero.combatProfile?.synergyWith)
        ? sanitizeStringArray(hero.combatProfile!.synergyWith, 60, 10)
        : [],
      counteredBy: Array.isArray(hero.combatProfile?.counteredBy)
        ? sanitizeStringArray(hero.combatProfile!.counteredBy, 60, 10)
        : [],
      bestFormation: sanitizeText(hero.combatProfile?.bestFormation, 300) || "Posicionamento tático de acordo com a função.",
      recommendedPositioningNote: sanitizeText(hero.combatProfile?.recommendedPositioningNote, 300),
    },
    unlockInfo: {
      serverDay,
      methods: Array.isArray(hero.unlockInfo?.methods) && hero.unlockInfo!.methods.length > 0
        ? sanitizeStringArray(hero.unlockInfo!.methods, 100, 10)
        : [serverDay === 1 ? "Recrutamento da Taberna" : `Desbloqueio no Dia ${serverDay}`],
      laterMethods: Array.isArray(hero.unlockInfo?.laterMethods)
        ? sanitizeStringArray(hero.unlockInfo!.laterMethods, 100, 10)
        : ["Loja de Fragmentos"],
      notes: sanitizeText(hero.unlockInfo?.notes, 500) || `Disponível a partir do dia ${serverDay} do servidor.`,
      isAvailableDay1: serverDay === 1,
    },
    skills: Array.isArray(hero.skills) && hero.skills.length > 0
      ? hero.skills.slice(0, 10).map((s, idx) => ({
          id: sanitizeSlug(s.id) || `${heroId}-skill-${idx + 1}`,
          name: sanitizeText(s.name, 100) || `Habilidade ${idx + 1}`,
          type: (["Ultimate", "Ativa", "Passiva"].includes(s.type)
            ? s.type
            : idx === 0
            ? "Ultimate"
            : idx === 1
            ? "Ativa"
            : "Passiva") as SkillType,
          description: sanitizeText(s.description, 1000) || "Descrição da habilidade de combate.",
          cooldown: sanitizeText(s.cooldown, 20) || (idx === 0 ? "16s" : idx === 1 ? "10s" : undefined),
          energyCost: typeof s.energyCost === "number" && !isNaN(s.energyCost) ? Math.max(0, Math.min(10000, Math.floor(s.energyCost))) : (idx === 0 ? 1000 : undefined),
          damageType: (["Physical", "Energy", "Mixed", "None"].includes(s.damageType as string) ? s.damageType : (hero.damageType as HeroDamageType)),
          icon: sanitizeUrl(s.icon, ""),
          progression: Array.isArray(s.progression) && s.progression.length > 0
            ? s.progression.slice(0, 10).map((p) => ({
                starLevel: sanitizeText(p.starLevel, 30),
                starsRequired: typeof p.starsRequired === "number" ? Math.max(1, Math.min(10, Math.floor(p.starsRequired))) : 2,
                title: sanitizeText(p.title, 100),
                description: sanitizeText(p.description, 500),
              }))
            : [
                { starLevel: "2★", starsRequired: 2, title: "Aprimoramento I", description: "Aumenta a eficácia da habilidade em +20%." },
                { starLevel: "4★", starsRequired: 4, title: "Aprimoramento II", description: "Aumenta o dano ou duração do efeito." },
                { starLevel: "6★ (🔴1)", starsRequired: 6, title: "Efeito Adicional", description: "Adiciona bônus especial à habilidade." },
                { starLevel: "8★ (🔴3)", starsRequired: 8, title: "Maestria de Batalha", description: "Reduz recarga ou amplifica poder passivo." },
                { starLevel: "10★ (🔴5)", starsRequired: 10, title: "Despertar Supremo", description: "Efeito destrutivo de nível máximo." },
              ],
        }))
      : createDefaultSkillsTemplate(heroId, hero.damageType as HeroDamageType),
    calculatorLinks: {
      antitoxinUrl: sanitizeUrl(hero.calculatorLinks?.antitoxinUrl, `/calculadoras?tab=antitoxin&hero=${slug}`),
      shardsUrl: sanitizeUrl(hero.calculatorLinks?.shardsUrl, `/calculadoras?tab=shards&hero=${slug}`),
      badgesUrl: sanitizeUrl(hero.calculatorLinks?.badgesUrl, `/calculadoras?tab=badges&hero=${slug}`),
    },
    sourceUrls: Array.isArray(hero.sourceUrls) && hero.sourceUrls.length > 0
      ? hero.sourceUrls.map((u) => sanitizeUrl(u)).filter(Boolean).slice(0, 10)
      : [`https://lastasylumplague.com/heroes/${slug}`],
    lastVerifiedAt: sanitizeText(hero.lastVerifiedAt, 20) || new Date().toISOString().slice(0, 10),
  };

  return { isValid: true, errors: [], sanitized };
}

// =========================================================================
// FUNÇÕES DE PERSISTÊNCIA E MUTATION
// =========================================================================

/**
 * Retorna todos os heróis cadastrados na base de dados (com leitura do cache local se em browser)
 */
export function getAllHeroes(): Hero[] {
  if (typeof window === "undefined") {
    return HEROES_DATA;
  }

  try {
    const raw = localStorage.getItem(HEROES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HEROES_STORAGE_KEY, JSON.stringify(HEROES_DATA));
      return HEROES_DATA;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Valida e sanitiza para garantir integridade caso o storage esteja adulterado
      const sanitizedList: Hero[] = [];
      for (const item of parsed) {
        const val = validateHero(item);
        if (val.isValid && val.sanitized) {
          sanitizedList.push(val.sanitized);
        }
      }
      return sanitizedList.length > 0 ? sanitizedList : HEROES_DATA;
    }
  } catch (error) {
    console.warn("Erro ao ler heróis do localStorage, usando base padrão:", error);
  }

  return HEROES_DATA;
}

/**
 * Busca de forma assíncrona os heróis do Supabase (se configurado) atualizando o cache local com validação profunda.
 */
export async function fetchHeroesAsync(): Promise<Hero[]> {
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import("./supabase");
      const { data, error } = await supabase
        .from("heroes_config")
        .select("*")
        .order("server_day", { ascending: true });

      if (!error && data && data.length > 0) {
        const parsedHeroes: Hero[] = [];

        for (const item of data) {
          let candidate: Partial<Hero>;
          if (item.data && typeof item.data === "object") {
            candidate = item.data as Hero;
          } else {
            candidate = {
              id: item.id,
              name: item.name || item.id,
              slug: item.slug || item.id,
              title: item.title || "",
              rarity: item.rarity || "UR",
              faction: item.faction || "Warrior",
              role: item.role || "Carry",
              damageType: item.damage_type || item.damageType || "Physical",
              avatarUrl: item.avatar_url || item.avatarUrl || "",
              fullImageUrl: item.full_image_url || item.fullImageUrl || "",
              bio: item.bio || "",
              combatProfile: item.combat_profile || { tags: [], position: "Frontline", pros: [], cons: [], synergyWith: [], counteredBy: [], bestFormation: "" },
              unlockInfo: item.unlock_info || { serverDay: item.server_day || 1, methods: [], notes: "", isAvailableDay1: (item.server_day || 1) === 1 },
              skills: item.skills || [],
              calculatorLinks: item.calculator_links || { antitoxinUrl: "", shardsUrl: "", badgesUrl: "" },
              sourceUrls: item.source_urls || [],
              lastVerifiedAt: item.last_verified_at || new Date().toISOString().slice(0, 10),
            };
          }

          const val = validateHero(candidate);
          if (val.isValid && val.sanitized) {
            parsedHeroes.push(val.sanitized);
          }
        }

        if (parsedHeroes.length > 0) {
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(HEROES_STORAGE_KEY, JSON.stringify(parsedHeroes));
              window.dispatchEvent(new CustomEvent("heroes_updated", { detail: { heroes: parsedHeroes } }));
              window.dispatchEvent(new Event("heroes_updated"));
            } catch (storageErr) {
              console.warn("Aviso ao salvar heróis no localStorage (cota de storage):", storageErr);
            }
          }
          return parsedHeroes;
        }
      }
    } catch (err) {
      console.warn("Supabase fetchHeroesAsync falhou, usando cache/fallback:", err);
    }
  }

  return getAllHeroes();
}

/**
 * Salva ou atualiza um herói no armazenamento local e sincroniza com o Supabase se configurado.
 */
export async function saveHero(heroData: Hero): Promise<{ success: boolean; hero: Hero; error?: string }> {
  const validation = validateHero(heroData);
  if (!validation.isValid || !validation.sanitized) {
    return {
      success: false,
      hero: heroData,
      error: validation.errors.join(" | "),
    };
  }

  const validHero = validation.sanitized;
  const currentList = getAllHeroes();
  const existingIndex = currentList.findIndex(
    (h) => h.id === validHero.id || h.slug === validHero.slug
  );

  let updatedList: Hero[];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = validHero;
  } else {
    updatedList = [...currentList, validHero];
  }

  // 1. Salva no localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HEROES_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent("heroes_updated", { detail: { heroes: updatedList } }));
      window.dispatchEvent(new Event("heroes_updated"));
    } catch (err: any) {
      console.error("Erro ao salvar herói no localStorage:", err);
      return { success: false, hero: validHero, error: "Limite de armazenamento local (quota) atingido ou storage desabilitado." };
    }
  }

  // 2. Sincroniza com Supabase se configurado
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import("./supabase");
      const payload = {
        id: validHero.id,
        slug: validHero.slug,
        name: validHero.name,
        title: validHero.title,
        rarity: validHero.rarity,
        faction: validHero.faction,
        role: validHero.role,
        damage_type: validHero.damageType,
        server_day: validHero.unlockInfo.serverDay,
        data: validHero,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("heroes_config")
        .upsert(payload, { onConflict: "id" });

      if (upsertError) {
        const { error: altError } = await supabase
          .from("heroes")
          .upsert(payload, { onConflict: "id" });

        if (altError) {
          console.warn("Supabase upsert warning (heroes_config/heroes):", altError.message);
        }
      }
    } catch (supabaseErr) {
      console.warn("Erro ao sincronizar herói no Supabase:", supabaseErr);
    }
  }

  return { success: true, hero: validHero };
}

/**
 * Remove um herói permanentemente da base de dados e storage.
 */
export async function deleteHero(heroId: string): Promise<{ success: boolean; error?: string }> {
  if (!heroId || typeof heroId !== "string") {
    return { success: false, error: "ID do herói inválido." };
  }

  const currentList = getAllHeroes();
  const normalizedId = sanitizeSlug(heroId).toLowerCase();
  const filtered = currentList.filter(
    (h) => h.id.toLowerCase() !== normalizedId && h.slug.toLowerCase() !== normalizedId
  );

  if (filtered.length === currentList.length) {
    return { success: false, error: "Herói não encontrado para exclusão." };
  }

  // 1. Salva no localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HEROES_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent("heroes_updated", { detail: { heroes: filtered } }));
      window.dispatchEvent(new Event("heroes_updated"));
    } catch (err) {
      console.error("Erro ao excluir herói do localStorage:", err);
    }
  }

  // 2. Deleta do Supabase se configurado
  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import("./supabase");
      await supabase.from("heroes_config").delete().eq("id", heroId);
      await supabase.from("heroes").delete().eq("id", heroId);
    } catch (supabaseErr) {
      console.warn("Erro ao deletar herói no Supabase:", supabaseErr);
    }
  }

  return { success: true };
}

/**
 * Restaura todos os 15 heróis oficiais para os valores de fábrica padrões.
 */
export async function resetHeroesToDefault(): Promise<{ success: boolean; heroes: Hero[]; error?: string }> {
  const defaultList = [...HEROES_DATA];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HEROES_STORAGE_KEY, JSON.stringify(defaultList));
      window.dispatchEvent(new CustomEvent("heroes_updated", { detail: { heroes: defaultList } }));
      window.dispatchEvent(new Event("heroes_updated"));
    } catch (err) {
      console.error("Erro ao resetar heróis no localStorage:", err);
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import("./supabase");
      const records = defaultList.map((h) => ({
        id: h.id,
        slug: h.slug,
        name: h.name,
        title: h.title,
        rarity: h.rarity,
        faction: h.faction,
        role: h.role,
        damage_type: h.damageType,
        server_day: h.unlockInfo.serverDay,
        data: h,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from("heroes_config").upsert(records, { onConflict: "id" });
    } catch (supabaseErr) {
      console.warn("Erro ao resetar heróis no Supabase:", supabaseErr);
    }
  }

  return { success: true, heroes: defaultList };
}

/**
 * Obtém as configurações gerais do servidor para controle de dias e heróis atuais/próximos.
 */
export function getServerSettings(): HeroServerSettings {
  if (typeof window === "undefined") {
    return DEFAULT_HERO_SERVER_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(HEROES_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_HERO_SERVER_SETTINGS,
        ...parsed,
        defaultServerAge: Math.min(3650, Math.max(1, Number(parsed.defaultServerAge) || 36)),
        currentServerDay: Math.min(3650, Math.max(1, Number(parsed.currentServerDay) || 36)),
        rotationCycleDays: Math.min(365, Math.max(1, Number(parsed.rotationCycleDays) || 7)),
        announcement: sanitizeText(parsed.announcement, 500) || DEFAULT_HERO_SERVER_SETTINGS.announcement,
      };
    }
  } catch (err) {
    console.warn("Erro ao ler configurações de servidor do herói:", err);
  }

  return DEFAULT_HERO_SERVER_SETTINGS;
}

/**
 * Salva e atualiza as configurações gerais do servidor para heróis com validação estrita.
 */
export async function saveServerSettings(
  settings: Partial<HeroServerSettings>
): Promise<{ success: boolean; settings: HeroServerSettings; error?: string }> {
  const current = getServerSettings();
  const rawDefault = Number(settings.defaultServerAge);
  const rawCurrent = Number(settings.currentServerDay);
  const rawCycle = Number(settings.rotationCycleDays);

  const updated: HeroServerSettings = {
    ...current,
    ...settings,
    defaultServerAge:
      !isNaN(rawDefault) && rawDefault > 0
        ? Math.min(3650, Math.max(1, Math.floor(rawDefault)))
        : current.defaultServerAge,
    currentServerDay:
      !isNaN(rawCurrent) && rawCurrent > 0
        ? Math.min(3650, Math.max(1, Math.floor(rawCurrent)))
        : current.currentServerDay,
    rotationCycleDays:
      !isNaN(rawCycle) && rawCycle > 0
        ? Math.min(365, Math.max(1, Math.floor(rawCycle)))
        : current.rotationCycleDays,
    announcement:
      typeof settings.announcement === "string"
        ? sanitizeText(settings.announcement, 500)
        : current.announcement,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HEROES_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("heroes_server_settings_updated", { detail: { settings: updated } }));
      window.dispatchEvent(new Event("heroes_server_settings_updated"));
      window.dispatchEvent(new Event("heroes_updated"));
    } catch (err) {
      console.error("Erro ao salvar configurações de servidor no localStorage:", err);
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { supabase } = await import("./supabase");
      await supabase.from("site_settings").upsert(
        {
          key: "heroes_server_settings",
          value: updated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    } catch (supabaseErr) {
      console.warn("Erro ao sincronizar configurações de servidor no Supabase:", supabaseErr);
    }
  }

  return { success: true, settings: updated };
}

export const updateServerSettings = saveServerSettings;

// =========================================================================
// FUNÇÕES DE CONSULTA PRINCIPAIS
// =========================================================================

/**
 * Busca um herói pelo seu slug amigável de URL (/herois/[slug])
 */
export function getHeroBySlug(slug: string): Hero | undefined {
  if (!slug) return undefined;
  const normalizedSlug = slug.trim().toLowerCase();
  const heroes = getAllHeroes();
  return heroes.find(
    (hero) => hero.slug.toLowerCase() === normalizedSlug || hero.id.toLowerCase() === normalizedSlug
  );
}

/**
 * Busca um herói pelo seu ID identificador único
 */
export function getHeroById(id: string): Hero | undefined {
  if (!id) return undefined;
  const normalizedId = id.trim().toLowerCase();
  const heroes = getAllHeroes();
  return heroes.find(
    (hero) => hero.id.toLowerCase() === normalizedId || hero.slug.toLowerCase() === normalizedId
  );
}

/**
 * Filtra heróis por Facção (Warrior, Ranger, Warlock)
 */
export function getHeroesByFaction(faction: HeroFaction | string): Hero[] {
  const heroes = getAllHeroes();
  if (!faction || faction === "Todos") return heroes;
  return heroes.filter((hero) => hero.faction.toLowerCase() === faction.toLowerCase());
}

/**
 * Filtra heróis por Função de Combate (Carry, Tank, Support)
 */
export function getHeroesByRole(role: HeroRole | string): Hero[] {
  const heroes = getAllHeroes();
  if (!role || role === "Todos") return heroes;
  return heroes.filter((hero) => hero.role.toLowerCase() === role.toLowerCase());
}

/**
 * Filtra heróis por Raridade (UR, SSR)
 */
export function getHeroesByRarity(rarity: HeroRarity | string): Hero[] {
  const heroes = getAllHeroes();
  if (!rarity || rarity === "Todos") return heroes;
  return heroes.filter((hero) => hero.rarity.toUpperCase() === rarity.toUpperCase());
}

/**
 * Filtra heróis por Tipo de Dano (Physical, Energy, Mixed)
 */
export function getHeroesByDamageType(damageType: HeroDamageType | string): Hero[] {
  const heroes = getAllHeroes();
  if (!damageType || damageType === "Todos") return heroes;
  return heroes.filter((hero) => hero.damageType.toLowerCase() === damageType.toLowerCase());
}

/**
 * Retorna heróis recomendados / relacionados (mesma facção ou alta sinergia)
 */
export function getRelatedHeroes(hero: Hero, limit: number = 3): Hero[] {
  if (!hero) return [];
  const heroes = getAllHeroes();

  // Prioriza heróis com sinergia explícita
  const synergyHeroes = hero.combatProfile.synergyWith
    .map((synergyId) => getHeroById(synergyId))
    .filter((h): h is Hero => h !== undefined && h.id !== hero.id);

  // Se precisar de mais para completar o limite, busca da mesma facção
  const sameFaction = heroes.filter(
    (h) => h.id !== hero.id && h.faction === hero.faction && !synergyHeroes.some((s) => s.id === h.id)
  );

  const combined = [...synergyHeroes, ...sameFaction];
  return combined.slice(0, limit);
}

// =========================================================================
// REGRAS DE NEGÓCIO, CATEGORIZAÇÃO E IDADE DO SERVIDOR
// =========================================================================

/**
 * Calcula o status de disponibilidade do herói com base na idade atual do servidor em dias
 */
export function calculateServerAgeStatus(hero: Hero, currentServerDay: number): ServerAgeStatus {
  const unlockDay = hero.unlockInfo.serverDay;
  const isAvailable = currentServerDay >= unlockDay;
  const daysLeft = Math.max(0, unlockDay - currentServerDay);

  let statusText = "";
  if (isAvailable) {
    if (unlockDay === 1) {
      statusText = "Disponível desde o Início (Dia 1)";
    } else {
      statusText = `Disponível no Servidor (Desbloqueado no Dia ${unlockDay})`;
    }
  } else {
    if (daysLeft === 1) {
      statusText = `Desbloqueia amanhã (Dia ${unlockDay} do Servidor)`;
    } else {
      statusText = `Desbloqueia em ${daysLeft} dias (Dia ${unlockDay} do Servidor)`;
    }
  }

  return {
    isAvailable,
    unlockDay,
    statusText,
    daysLeft,
  };
}

/**
 * Categoriza todos os heróis entre "Atuais / Disponíveis" e "Próximos / Em Breve"
 * com base no dia do servidor fornecido ou configurado.
 */
export function categorizeHeroesByServerAge(
  heroesList?: Hero[],
  serverDay?: number
): HeroesCategorizationResult {
  const heroes = heroesList && heroesList.length > 0 ? heroesList : getAllHeroes();
  const day =
    typeof serverDay === "number" && serverDay > 0
      ? serverDay
      : getServerSettings().currentServerDay;

  const available: CategorizedHero[] = [];
  const upcoming: CategorizedHero[] = [];

  heroes.forEach((hero) => {
    const status = calculateServerAgeStatus(hero, day);
    const categorizedHero: CategorizedHero = {
      ...hero,
      status,
    };

    if (status.isAvailable) {
      available.push(categorizedHero);
    } else {
      upcoming.push(categorizedHero);
    }
  });

  // Ordena disponíveis pelo dia de liberação crescente
  available.sort((a, b) => a.unlockInfo.serverDay - b.unlockInfo.serverDay);

  // Ordena próximos pelo dia de liberação crescente
  upcoming.sort((a, b) => a.unlockInfo.serverDay - b.unlockInfo.serverDay);

  const nextUnlock =
    upcoming.length > 0
      ? {
          hero: upcoming[0],
          daysLeft: Math.max(0, upcoming[0].unlockInfo.serverDay - day),
        }
      : null;

  return {
    available,
    upcoming,
    nextUnlock,
    currentServerDay: day,
    totalCount: heroes.length,
    availableCount: available.length,
    upcomingCount: upcoming.length,
  };
}

/**
 * Retorna o próximo herói a ser desbloqueado no servidor, com a contagem de dias restantes
 */
export function getNextHeroUnlock(currentServerDay: number, heroesList?: Hero[]): NextHeroUnlock | null {
  const heroes = heroesList && heroesList.length > 0 ? heroesList : getAllHeroes();
  const upcomingHeroes = heroes
    .filter((hero) => hero.unlockInfo.serverDay > currentServerDay)
    .sort((a, b) => a.unlockInfo.serverDay - b.unlockInfo.serverDay);

  if (upcomingHeroes.length === 0) {
    return null;
  }

  const nextHero = upcomingHeroes[0];
  const daysLeft = Math.max(0, nextHero.unlockInfo.serverDay - currentServerDay);

  return {
    nextHero,
    daysLeft,
  };
}

/**
 * Filtro avançado e flexível para a listagem e busca da Central de Heróis
 */
export function filterHeroes(options: HeroFilterOptions = {}): Hero[] {
  const {
    search = "",
    faction = "Todos",
    role = "Todos",
    rarity = "Todos",
    damageType = "Todos",
    serverAge,
    availability = "all",
    tag,
  } = options;

  const normalizedSearch = search.trim().toLowerCase();
  const heroes = getAllHeroes();

  return heroes.filter((hero) => {
    // 1. Busca por nome, título, bio, tags ou habilidades
    if (normalizedSearch) {
      const matchName = hero.name.toLowerCase().includes(normalizedSearch);
      const matchTitle = hero.title.toLowerCase().includes(normalizedSearch);
      const matchBio = hero.bio.toLowerCase().includes(normalizedSearch);
      const matchTags = hero.combatProfile.tags.some((t) => t.toLowerCase().includes(normalizedSearch));
      const matchSkills = hero.skills.some(
        (s) => s.name.toLowerCase().includes(normalizedSearch) || s.description.toLowerCase().includes(normalizedSearch)
      );

      if (!matchName && !matchTitle && !matchBio && !matchTags && !matchSkills) {
        return false;
      }
    }

    // 2. Filtro de Facção
    if (faction && faction !== "Todos" && hero.faction.toLowerCase() !== faction.toLowerCase()) {
      return false;
    }

    // 3. Filtro de Função (Role)
    if (role && role !== "Todos" && hero.role.toLowerCase() !== role.toLowerCase()) {
      return false;
    }

    // 4. Filtro de Raridade (UR, SSR)
    if (rarity && rarity !== "Todos" && hero.rarity.toUpperCase() !== rarity.toUpperCase()) {
      return false;
    }

    // 5. Filtro de Tipo de Dano
    if (damageType && damageType !== "Todos" && hero.damageType.toLowerCase() !== damageType.toLowerCase()) {
      return false;
    }

    // 6. Filtro por Tag de Combate
    if (tag && tag !== "Todos") {
      const hasTag = hero.combatProfile.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
      if (!hasTag) return false;
    }

    // 7. Filtro por Idade do Servidor e Disponibilidade
    if (serverAge !== undefined && serverAge > 0) {
      const status = calculateServerAgeStatus(hero, serverAge);
      if (availability === "available" && !status.isAvailable) {
        return false;
      }
      if (availability === "upcoming" && status.isAvailable) {
        return false;
      }
    }

    return true;
  });
}

// =========================================================================
// UTILITÁRIOS DE FORMATAÇÃO E TRADUÇÃO PT-BR
// =========================================================================

/**
 * Tradução amigável da Facção para Português
 */
export function getFactionLabel(faction: HeroFaction | string): string {
  switch (faction) {
    case "Warrior":
      return "Guerreiro";
    case "Ranger":
      return "Atirador";
    case "Warlock":
      return "Feiticeiro";
    default:
      return faction;
  }
}

/**
 * Tradução amigável da Função para Português
 */
export function getRoleLabel(role: HeroRole | string): string {
  switch (role) {
    case "Carry":
      return "Carry (Dano Principal)";
    case "Tank":
      return "Tanque (Defesa)";
    case "Support":
      return "Suporte (Utilidade)";
    default:
      return role;
  }
}

/**
 * Tradução amigável do Tipo de Dano para Português
 */
export function getDamageTypeLabel(damageType: HeroDamageType | string): string {
  switch (damageType) {
    case "Physical":
      return "Dano Físico";
    case "Energy":
      return "Dano de Energia";
    case "Mixed":
      return "Dano Misto";
    default:
      return damageType;
  }
}

/**
 * Cores temáticas para as insígnias de raridade
 */
export function getRarityBadgeColor(rarity: HeroRarity | string): string {
  switch (rarity) {
    case "UR":
      return "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]";
    case "SSR":
      return "bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]";
    default:
      return "bg-slate-900/80 text-slate-300 border-slate-700";
  }
}

/**
 * Cores temáticas para as insígnias de facção
 */
export function getFactionBadgeColor(faction: HeroFaction | string): string {
  switch (faction) {
    case "Warrior":
      return "bg-red-950/70 text-red-300 border-red-500/40";
    case "Ranger":
      return "bg-emerald-950/70 text-emerald-300 border-emerald-500/40";
    case "Warlock":
      return "bg-violet-950/70 text-violet-300 border-violet-500/40";
    default:
      return "bg-slate-900/70 text-slate-300 border-slate-700";
  }
}

/**
 * Cores temáticas para as insígnias de função (Role)
 */
export function getRoleBadgeColor(role: HeroRole | string): string {
  switch (role) {
    case "Carry":
      return "bg-orange-950/70 text-orange-300 border-orange-500/40";
    case "Tank":
      return "bg-blue-950/70 text-blue-300 border-blue-500/40";
    case "Support":
      return "bg-teal-950/70 text-teal-300 border-teal-500/40";
    default:
      return "bg-slate-900/70 text-slate-300 border-slate-700";
  }
}

/**
 * Lista de facções disponíveis com rótulos em Português
 */
export function getHeroFactions(): { value: HeroFaction; label: string }[] {
  return [
    { value: "Warrior", label: "Guerreiro" },
    { value: "Ranger", label: "Atirador" },
    { value: "Warlock", label: "Feiticeiro" },
  ];
}

/**
 * Lista de funções disponíveis com rótulos em Português
 */
export function getHeroRoles(): { value: HeroRole; label: string }[] {
  return [
    { value: "Carry", label: "Carry (Dano)" },
    { value: "Tank", label: "Tanque (Defesa)" },
    { value: "Support", label: "Suporte (Cura & Controle)" },
  ];
}

/**
 * Lista de raridades disponíveis com rótulos em Português
 */
export function getHeroRarities(): { value: HeroRarity; label: string }[] {
  return [
    { value: "UR", label: "UR (Ultra Raro)" },
    { value: "SSR", label: "SSR (Super Raro)" },
  ];
}

/**
 * Retorna todas as tags de combate distintas presentes na base de dados
 */
export function getAllCombatTags(): string[] {
  const tagsSet = new Set<string>();
  const heroes = getAllHeroes();
  heroes.forEach((hero) => {
    hero.combatProfile.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

