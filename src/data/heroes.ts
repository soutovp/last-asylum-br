/**
 * Last Asylum BR - Base de Dados Oficial de Heróis e Habilidades
 * Last Asylum Plague / LAP
 *
 * Idioma: Português do Brasil (pt-BR)
 * Data de Verificação: 2026-08-23
 */

export type HeroRarity = 'UR' | 'SSR';

export type HeroFaction = 'Warrior' | 'Ranger' | 'Warlock';

export type HeroRole = 'Carry' | 'Tank' | 'Support';

export type HeroDamageType = 'Physical' | 'Energy' | 'Mixed';

export type HeroPosition = 'Frontline' | 'Backline' | 'Flexible';

export type SkillType = 'Ultimate' | 'Ativa' | 'Passiva';

export type HeroAvailabilityFilter = 'all' | 'available' | 'upcoming';

export interface SkillProgressionStep {
  starLevel: string; // Ex: '2★', '4★', '6★ (🔴1)', '8★ (🔴3)', '10★ (🔴5)'
  starsRequired: number; // Ex: 2, 4, 6, 8, 10
  title?: string;
  description: string;
  bonusStats?: Record<string, string | number>;
}

export interface HeroSkill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  cooldown?: string;
  energyCost?: number;
  damageType?: HeroDamageType | 'None';
  icon?: string;
  progression?: SkillProgressionStep[];
}

export interface HeroUnlockInfo {
  serverDay: number;
  methods: string[];
  laterMethods?: string[];
  notes: string;
  isAvailableDay1: boolean;
}

export interface HeroCombatProfile {
  tags: string[];
  position: HeroPosition;
  pros: string[];
  cons: string[];
  synergyWith: string[];
  counteredBy: string[];
  bestFormation: string;
  recommendedPositioningNote?: string;
}

export interface HeroCalculatorLinks {
  antitoxinUrl: string;
  shardsUrl: string;
  badgesUrl: string;
}

export interface Hero {
  id: string;
  name: string;
  slug: string;
  title: string;
  rarity: HeroRarity;
  faction: HeroFaction;
  role: HeroRole;
  damageType: HeroDamageType;
  avatarUrl: string;
  fullImageUrl: string;
  bannerUrl?: string;
  bio: string;
  lore?: string;
  quote?: string;
  tier?: 'S+' | 'S' | 'A+' | 'A' | 'B';
  combatProfile: HeroCombatProfile;
  unlockInfo: HeroUnlockInfo;
  skills: HeroSkill[];
  calculatorLinks: HeroCalculatorLinks;
  sourceUrls: string[];
  lastVerifiedAt: string;
}

export const HEROES_DATA: Hero[] = [
  // =========================================================================
  // 1. NICOLE (UR)
  // =========================================================================
  {
    id: 'nicole',
    name: 'Nicole',
    slug: 'nicole',
    title: 'A Bruxa da Peste Tóxica',
    rarity: 'UR',
    faction: 'Warlock',
    role: 'Carry',
    damageType: 'Energy',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp',
    bio: 'Nicole domina as artes arcanas proibidas e manipula o fogo tóxico para devastar exércitos inteiros à distância. Sua presença na retaguarda garante destruição massiva contínua através de queimaduras elementais e explosões em cadeia.',
    lore: 'Nascida nos arredores contaminados do Asilo 07, Nicole aprendeu a canalizar as toxinas ambientais em labaredas de plasma verde. Onde outros sucumbiram à infecção, ela encontrou poder ilimitado.',
    quote: 'O fogo da praga purifica tudo o que toca.',
    tier: 'S+',
    combatProfile: {
      tags: ['Burn', 'AoE', 'Energy Damage', 'Carry', 'DoT', 'Backline', 'Crit'],
      position: 'Backline',
      pros: [
        'Dano de área (AoE) colossal capaz de dizimar esquadrões inteiros',
        'Queimadura contínua que consome a vida máxima dos alvos',
        'Sinergia altíssima com heróis de redução de resistência elemental',
      ],
      cons: [
        'Defesa física baixa tornando-a vulnerável a assassinos',
        'Necessita de boa proteção de linha de frente para carregar a Ultimate com segurança',
      ],
      synergyWith: ['daskal', 'marlena', 'jester', 'cynthia'],
      counteredBy: ['bell', 'shadow'],
      bestFormation: 'Posicionada na linha traseira central protegida por tanques de alta durabilidade como Marlena ou Zoya.',
      recommendedPositioningNote: 'Mantenha Nicole na 4ª ou 5ª posição da retaguarda com visão aberta de campo.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['1st Top Up (Primeira Recarga)', 'Pacotes da Loja', 'Oferta Diária'],
      laterMethods: ['Recrutamento da Taberna', 'Loja de Fragmentos'],
      notes: 'Disponível desde o Dia 1 no bônus de 1ª Recarga e ofertas especiais. Mais tarde entra na rotação regular da Taberna.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'nicole-ult',
        name: 'Chuva de Fogo Tóxico',
        type: 'Ultimate',
        cooldown: '16s',
        energyCost: 1000,
        damageType: 'Energy',
        description: 'Invoca meteoros flamejantes de matéria tóxica sobre todo o esquadrão inimigo, causando 380% de Dano de Energia e aplicando Queimadura Tóxica por 6s (60% de dano por segundo).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Impacto Ignóbil',
            description: 'Dano base do meteoro aumentado para 450% de Dano de Energia.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Combustão Prolongada',
            description: 'Duração da Queimadura Tóxica aumentada para 8 segundos (+33% de dano residual total).',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Chamas Fatais',
            description: 'Meteoros causam Acerto Crítico garantido em qualquer inimigo que já esteja sob efeito de Queimadura.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Aceleração Piromântica',
            description: 'Reduz o tempo de recarga da Chuva de Fogo em 3s e concede +25% de Ataque de Energia passivo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Apocalipse Tóxico',
            description: 'Inimigos queimados sofrem 40% mais dano de toda a equipe e explodem ao serem abatidos, espalhando chamas tóxicas aos vizinhos.',
          },
        ],
      },
      {
        id: 'nicole-active',
        name: 'Chamas Dilacerantes',
        type: 'Ativa',
        cooldown: '10s',
        damageType: 'Energy',
        description: 'Dispara uma torrente de fogo corrosivo em linha reta atingindo até 3 inimigos, causando 220% de Dano de Energia e reduzindo a Defesa de Energia dos alvos em 20% por 5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Alcance Perfurante',
            description: 'Dano aumentado para 260% e agora atinge todos os inimigos presentes na linha de trajetória.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Corrosão Ácida',
            description: 'Redução de Defesa de Energia aumentada para 30%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Fogo Paralisante',
            description: 'Aplica 30% de lentidão na velocidade de ataque e movimentação dos alvos atingidos.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Alimentar a Chama',
            description: 'Gera 150 pontos adicionais de Energia caso atinja 2 ou mais alvos.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Dilaceração Profunda',
            description: 'Ignora 50% da resistência elemental dos alvos atingidos e renova a duração de todas as Queimaduras ativas.',
          },
        ],
      },
      {
        id: 'nicole-passive',
        name: 'Maestria Arcana',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta permanentemente o Dano de Energia de Nicole em 20% e a Taxa de Acerto Crítico em 15%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Sobrecarga Arcana',
            description: 'Bônus de Dano de Energia aumentado para 28%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Precisão Elemental',
            description: 'Taxa Crítica aumentada para 22% e Dano Crítico aumentado em +25%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Sifão Mágico',
            description: 'Cada acerto crítico restaura 40 pontos de Energia instantaneamente para Nicole.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Aura da Bruxa',
            description: 'Aumenta o Dano de Energia de todos os heróis Feiticeiros aliados em 15%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Ascensão da Peste',
            description: 'Ao entrar no combate, inicia a batalha com 500 de Energia acumulada.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=nicole',
      shardsUrl: '/calculadoras?tab=shards&hero=nicole',
      badgesUrl: '/calculadoras?tab=badges&hero=nicole',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/nicole',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 2. ANNIE (UR)
  // =========================================================================
  {
    id: 'annie',
    name: 'Annie',
    slug: 'annie',
    title: 'A Franco-Atiradora Implacável',
    rarity: 'UR',
    faction: 'Ranger',
    role: 'Carry',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/annie-full-image-226x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/annie-full-image-226x300.webp',
    bio: 'Annie é a atiradora de elite primordial do Last Asylum. Com disparos de precisão cirúrgica e projéteis perfurantes de alto calibre, é especialista em triturar os tanques mais pesados e alvos isolados da linha inimiga.',
    lore: 'Ex-atiradora da força de contenção, Annie nunca perdeu um único alvo. Seu rifle personalizado opera com cartuchos antimaterial fabricados com ligas de titânio recuperadas.',
    quote: 'Um tiro, um abate. Sem desperdício de munição.',
    tier: 'S',
    combatProfile: {
      tags: ['Single Target', 'Burst', 'Crit', 'Physical Damage', 'Armor Break', 'Ranger', 'Carry'],
      position: 'Backline',
      pros: [
        'Altíssimo dano concentrado em alvo único (Single Target Burst)',
        'Penetração brutal de armadura contra tanques de linha de frente',
        'Alta taxa de acerto crítico e multiplicador elevado',
      ],
      cons: [
        'Baixa capacidade de dano em área (AoE)',
        'Sensível a ataques furtivos que alcancem o fundo do cenário',
      ],
      synergyWith: ['marlena', 'billy', 'arthur', 'cynthia'],
      counteredBy: ['shadow', 'bell'],
      bestFormation: 'Posicionada no canto traseiro para manter distância máxima de engajamento e disparar com segurança.',
      recommendedPositioningNote: 'Posição 3 ou 5 na linha de retaguarda para focar o tanque de maior valor.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['Recrutamento da Taberna', 'Pacotes de Invocação Avançada'],
      laterMethods: ['Hero Pass', 'Loja de Fragmentos'],
      notes: 'Disponível desde a inauguração do servidor na Taberna e pacotes de boas-vindas.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'annie-ult',
        name: 'Tiro Perfurante Devastador',
        type: 'Ultimate',
        cooldown: '14s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Carrega um projétil de alta velocidade e dispara no alvo prioritário, causando 520% de Dano Físico e perfurando 40% da armadura total do alvo.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Calibre Pesado',
            description: 'Dano aumentado para 600% e perfuração de armadura aumentada para 50%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Mira Focada',
            description: 'Ganha 25% de Taxa Crítica extra ao conjurar a Ultimate.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Projétil Transpassante',
            description: 'O projétil perfura o primeiro alvo e atinge o inimigo posicionado logo atrás com 80% do dano.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Tiro de Caçador',
            description: 'Causa +45% de dano adicional contra alvos com mais de 70% de vida.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Execução Implacável',
            description: 'Se o Tiro Perfurante abater o inimigo, Annie recupera instantaneamente 600 de Energia e ganha +30% de Ataque por 8s.',
          },
        ],
      },
      {
        id: 'annie-active',
        name: 'Disparo de Precisão Rápido',
        type: 'Ativa',
        cooldown: '9s',
        damageType: 'Physical',
        description: 'Efetua 3 disparos rápidos sucessivos no alvo com menor defesa, cada um causando 110% de Dano Físico.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Cadência Mortal',
            description: 'Dano por disparo aumentado para 135% (405% de Dano Físico total).',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Ponto Fraco',
            description: 'Cada disparo reduz a defesa do alvo em 8% cumulativo (até 24% de redução).',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Tiro Certeiro',
            description: 'O terceiro disparo é um acerto crítico garantido.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Agilidade do Atirador',
            description: 'Aumenta a velocidade de ataque de Annie em 20% por 4s após a ativação.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Rajada de Quatro Tiros',
            description: 'Dispara 4 tiros em vez de 3 e aplica sangramento contínuo por 5s.',
          },
        ],
      },
      {
        id: 'annie-passive',
        name: 'Olhos de Águia',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta permanentemente o Alcance de Ataque em 25%, a Taxa Crítica em 18% e a Precisão em 30%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Foco Visual',
            description: 'Taxa Crítica aumentada para 25%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Impacto Balístico',
            description: 'Dano Crítico aumentado em +35%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Vantagem de Distância',
            description: 'Ataques básicos a longa distância causam até 25% de dano bônus baseado na distância do alvo.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Comando de Tiro',
            description: 'Concede +15% de Velocidade de Ataque para todos os Rangers da equipe.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Tiro Duplo Espontâneo',
            description: 'Ataques básicos têm 25% de chance de disparar um tiro duplo sem custo de recarga.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=annie',
      shardsUrl: '/calculadoras?tab=shards&hero=annie',
      badgesUrl: '/calculadoras?tab=badges&hero=annie',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/annie',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 3. MARLENA (UR)
  // =========================================================================
  {
    id: 'marlena',
    name: 'Marlena',
    slug: 'marlena',
    title: 'A Lâmina Rubra dos Guerreiros',
    rarity: 'UR',
    faction: 'Warrior',
    role: 'Carry',
    damageType: 'Energy',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/marlena-full-image-300x281.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/marlena-full-image-300x281.webp',
    bio: 'Marlena é a principal atacante Carry da facção Guerreiro (Warrior) no Last Asylum. Especialista no combate com lâminas de plasma, ela desfere golpes devastadores que cortam as defesas inimigas com rajadas consecutivas de vento de espada e flores carmesim explosivas.',
    lore: 'Nobre guerreira forjada nas arenas de contenção, Marlena jurou lealdade ao refúgio. Sua espada canaliza energia plasmática pura, capaz de partir blindagens de titânio ao meio.',
    quote: 'Minha lâmina não conhece hesitação.',
    tier: 'S+',
    combatProfile: {
      tags: ['Carry', 'Single Target', 'Burst', 'Energy Damage', 'Crit', 'Warrior'],
      position: 'Backline',
      pros: [
        'Dano de Energia massivo em alvos únicos e rajadas de lâmina',
        'Multiplicadores de ataque extremos com vento de espada consecutivo',
        'Alta taxa de dano crítico e perfuração de armadura',
      ],
      cons: [
        'Necessita de tanques duráveis na vanguarda para garantir seu tempo de carga',
        'Defesa física moderada',
      ],
      synergyWith: ['arthur', 'daskal', 'zoya', 'nicole'],
      counteredBy: ['billy', 'shadow'],
      bestFormation: 'Posicionada na retaguarda ou linha central, protegida por Arthur ou Daskal.',
      recommendedPositioningNote: 'Mantenha Marlena protegida na linha traseira para maximizar o número de rajadas de espada.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['1st Top Up (Primeira Recarga)', 'Bônus de Recarga', 'Oferta Diária', 'Taberna'],
      laterMethods: ['Loja de Fragmentos da Aliança'],
      notes: 'A Carry UR de referência do Dia 1 da facção Guerreiro. Excelente tanto para a progressão de campanha quanto para o PvP competitivo.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'marlena-ult',
        name: 'Lâmina Incomparável (Peerless Blade)',
        type: 'Ultimate',
        cooldown: '13.6s',
        energyCost: 1000,
        damageType: 'Energy',
        description: 'Libera 3 rajadas cortantes de vento de espada, cada uma visando um inimigo aleatório e causando 2818.75% do ATK como Dano de Energia.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Rajada Adicional',
            description: 'Vento de Espada +1; cada rajada causa 20% de dano adicional.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Lâmina Penetrante',
            description: 'Cada rajada causa 60% de dano extra e ignora 15% da defesa do alvo.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Tormenta de Plasma',
            description: 'Cada rajada causa 100% de dano adicional.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Fúria Cortante',
            description: 'Cada rajada causa 120% de dano adicional e gera 150 de energia ao abater um alvo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Lâmina Absoluta',
            description: 'Vento de Espada +1 adicional; cada rajada causa 140% de dano extra.',
          },
        ],
      },
      {
        id: 'marlena-active',
        name: 'Desabrochar Carmesim (Crimson Bloom)',
        type: 'Ativa',
        cooldown: '18s',
        damageType: 'Energy',
        description: 'Arremessa uma flor escarlate de plasma que explode no impacto, causando 1218.75% do ATK como Dano de Energia a todos os alvos na área.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Pétalas Explosivas',
            description: 'Dano de área aumentado para 1450% do ATK.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Detonação Rápida',
            description: 'Tempo de recarga reduzido em 3s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Chamas Escarlates',
            description: 'Inimigos atingidos sofrem 30% de dano de queimadura contínua por 4s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Fragmentação Letal',
            description: 'Aumenta o raio da explosão em 50% e reduz a resistência elemental dos alvos em 20%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Desabrochar Supremo',
            description: 'Causa acerto crítico garantido nos 2 alvos com menor HP.',
          },
        ],
      },
      {
        id: 'marlena-passive',
        name: 'Corte Quebra-Céus (Skybreaker Slash)',
        type: 'Passiva',
        damageType: 'Energy',
        description: 'Ataque energizado que desfere um golpe de vento de espada, causando 652.5% do ATK como Dano de Energia a um alvo único.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Corte Reforçado',
            description: 'Causa 40% de dano extra no ataque energizado.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Gume Afiado',
            description: 'Aumenta a Taxa Crítica de Marlena em +15%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Impacto Profundo',
            description: 'Dano extra aumentado para 100%.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Celeridade da Espada',
            description: 'Aumenta a velocidade de ataque básico em 25%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Corte Transcendente',
            description: 'Dano extra aumentado para 200%.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=marlena',
      shardsUrl: '/calculadoras?tab=shards&hero=marlena',
      badgesUrl: '/calculadoras?tab=badges&hero=marlena',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/marlena',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 4. JESTER (UR)
  // =========================================================================
  {
    id: 'jester',
    name: 'Jester',
    slug: 'jester',
    title: 'O Mestre do Caos e Ilusão',
    rarity: 'UR',
    faction: 'Warlock',
    role: 'Support',
    damageType: 'Energy',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/jester-full-image-275x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/jester-full-image-275x300.webp',
    bio: 'Jester transforma a batalha em um espetáculo de desordem. Com truques de espelhos, caixas surpresa e venenos alucinógenos, ele confunde formações inimigas forçando adversários a atacarem seus próprios companheiros.',
    lore: 'Antes do apocalipse, era um ilusionista talentoso. Quando a peste transformou o mundo, ele decidiu que a insanidade era a única resposta lúcida diante do colapso.',
    quote: 'Por que tão sério quando o fim do mundo é uma piada?',
    tier: 'S',
    combatProfile: {
      tags: ['Support', 'Crowd Control', 'Confusion', 'Energy Damage', 'Debuff', 'Disruptor', 'Warlock'],
      position: 'Flexible',
      pros: [
        'Controle de grupo excepcional com efeito de Confusão e Medo',
        'Redução severa no ataque e dano dos adversários',
        'Mecanismo de escape com imunidade temporária contra golpes fatais',
      ],
      cons: [
        'Dano direto moderado',
        'Depende de aliados ofensivos para converter o controle em abates',
      ],
      synergyWith: ['nicole', 'red-lady', 'cynthia', 'harper'],
      counteredBy: ['marlena', 'cynthia'],
      bestFormation: 'Meio-campo ou retaguarda, permitindo lançar caixas surpresas sobre o maior agrupamento inimigo.',
      recommendedPositioningNote: 'Posição flexível entre linha média e traseira para cobrir o campo com caixas surpresa.',
    },
    unlockInfo: {
      serverDay: 8,
      methods: ['Hero Pass Temporada 2', 'Pacotes Especiais do Dia 8'],
      laterMethods: ['Recrutamento da Taberna', 'Oferta Diária'],
      notes: 'Desbloqueia a partir do Dia 8 do servidor no Hero Pass de Temporada 2. Um divisor de águas para táticas de controle no PvP.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'jester-ult',
        name: 'Caos Ilusório',
        type: 'Ultimate',
        cooldown: '17s',
        energyCost: 1000,
        damageType: 'Energy',
        description: 'Espalha caixas surpresas arcanas no campo adversário, causando 280% de Dano de Energia e aplicando Confusão por 3.5s (inimigos têm 50% de chance de atacar aliados ou errar ataques).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Delírio Prolongado',
            description: 'Duração da Confusão aumentada para 4.5s.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Drenagem Mental',
            description: 'Dano aumentado para 340% e drena 150 pontos de energia dos inimigos afetados.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Vulnerabilidade Histérica',
            description: 'Inimigos sob Confusão sofrem 25% mais dano de todas as fontes aliadas.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Terror Teatral',
            description: 'Reduz o tempo de recarga da Ultimate em 3s e aplica Medo (Fear) por 2s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Anarquia Absoluta',
            description: 'Afeta 100% dos inimigos no mapa por 5s e zera o ganho de energia dos alvos durante o efeito.',
          },
        ],
      },
      {
        id: 'jester-active',
        name: 'Adaga da Trapaça',
        type: 'Ativa',
        cooldown: '9s',
        damageType: 'Energy',
        description: 'Teletransporta-se instantaneamente atrás do inimigo de maior ataque, desferindo uma punhalada de 240% de Dano de Energia e reduzindo o ataque do alvo em 25% por 5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Desarme Sorrateiro',
            description: 'Redução de ataque aumentada para 35%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Golpe Mudo',
            description: 'Silencia o alvo atingido por 3s, impedindo o uso de habilidades.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Passo Ilusório',
            description: 'Jester ganha 40% de esquiva por 3.5s após o teletransporte.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Adaga Envenenada',
            description: 'Dano aumentado para 320% com acerto crítico garantido.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Duplo Trapaceiro',
            description: 'Ao usar a Adaga, cria um clone ilusório que absorve até 25% de dano por 5s.',
          },
        ],
      },
      {
        id: 'jester-passive',
        name: 'Gargalhada Sinistra',
        type: 'Passiva',
        damageType: 'None',
        description: 'A risada perturbadora de Jester reduz permanentemente o Ataque e a Velocidade de Movimento de todos os inimigos em 12%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Riso Desesperador',
            description: 'Redução de Ataque inimigo aumentada para 18%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Mente Frágil',
            description: 'Inimigos com debuffs sofrem 15% a mais de Dano de Energia de todas as fontes.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Última Piada',
            description: 'Ao sofrer um golpe fatal, Jester fica invisível e imune a todo dano por 2.5s (1x por combate).',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Festa dos Tolos',
            description: 'Gera 25 de energia passiva por segundo enquanto houver inimigos sob efeito de confusão.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Eterno Ridículo',
            description: 'Todos os debuffs aplicados por Jester têm sua duração aumentada em 50%.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=jester',
      shardsUrl: '/calculadoras?tab=shards&hero=jester',
      badgesUrl: '/calculadoras?tab=badges&hero=jester',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/jester',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 5. RED LADY (UR)
  // =========================================================================
  {
    id: 'red-lady',
    name: 'Red Lady',
    slug: 'red-lady',
    title: 'A Dama da Lâmina Escarlate',
    rarity: 'UR',
    faction: 'Warrior',
    role: 'Carry',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/red-lady-full-image-284x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/red-lady-full-image-284x300.webp',
    bio: 'A Red Lady é uma combatente formidável de linha de frente. Com suas cimitarras afiadas e sede por sangue, ela fatia a vanguarda inimiga enquanto se regenera vorazmente a cada corte desferido.',
    lore: 'Líder dos mercenários do Sangue Escarlate, ela sobreviveu a duelos contra aberrações colossais banhando suas lâminas nas toxinas de seus oponentes.',
    quote: 'Seu sangue servirá de combustível para o meu avanço.',
    tier: 'S+',
    combatProfile: {
      tags: ['Carry', 'Life Steal', 'Bleed', 'Physical Damage', 'Frontline DPS', 'Sustain', 'Warrior'],
      position: 'Frontline',
      pros: [
        'Sustain e roubo de vida massivos em combates prolongados',
        'Sangramento profundo que ignora defesas convencionais',
        'Alta durabilidade combinada com dano sustentado contínuo',
      ],
      cons: [
        'Vulnerável a efeitos de redução de cura severa (Anti-heal)',
        'Precisa estar colada nos alvos para manter o ciclo de cura',
      ],
      synergyWith: ['marlena', 'arthur', 'cynthia', 'zoya'],
      counteredBy: ['daskal', 'harper'],
      bestFormation: 'Segunda posição da linha frontal, ao lado de Marlena, permitindo bater e se curar continuamente.',
      recommendedPositioningNote: 'Posicione na lateral da frente para flanquear os tanques inimigos.',
    },
    unlockInfo: {
      serverDay: 15,
      methods: ['Hero Pass Temporada 3', 'Pacotes de Temporada do Dia 15'],
      laterMethods: ['Recrutamento da Taberna', 'Loja de Fragmentos'],
      notes: 'Disponível a partir do Dia 15 no Hero Pass. Um dos heróis de transição mais fortes e requisitados para o mid/late game.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'red-lady-ult',
        name: 'Dança da Lâmina Escarlate',
        type: 'Ultimate',
        cooldown: '15s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Gira em turbilhão causando 460% de Dano Físico em cone frontal, aplicando 3 acúmulos de Sangramento Profundo e convertendo 35% do dano causado em Vida imediata.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Sede Insaciável',
            description: 'Dano aumentado para 540% e roubo de vida aumentado para 45%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Dilaceração Arterial',
            description: 'Causa +30% de dano adicional contra alvos que já estejam sob sangramento.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Fúria Inabalável',
            description: 'Durante a rotação da Ultimate, fica imune a controles de grupo e ganha +30% de velocidade de movimento.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Escudo Carmesim',
            description: 'Toda cura excedente de roubo de vida é convertida em um Escudo Sangrento que dura 6s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Massacre Sangrento',
            description: 'Inimigos atingidos perdem 50% de regeneração de vida e sofrem dano de sangramento em dobro por 10s.',
          },
        ],
      },
      {
        id: 'red-lady-active',
        name: 'Frenesi Carniceiro',
        type: 'Ativa',
        cooldown: '10s',
        damageType: 'Physical',
        description: 'Desfere um golpe vertical profundo causando 240% de Dano Físico e aumentando a sua Velocidade de Ataque em 40% e Roubo de Vida em 20% por 6s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Fúria Acelerada',
            description: 'Velocidade de Ataque aumentada para +55%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Corte Crítico',
            description: 'Dano aumentado para 300% com 25% de chance de acerto crítico extra.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Golpe Atordoante',
            description: 'Ataques sob efeito do Frenesi causam mini-atordoamentos de 0.3s nos alvos.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Adrenalina Escarlate',
            description: 'Duração do buff estendida para 8s e acumula +15% de Dano Físico passivo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Ciclo Voraz',
            description: 'Reduz o tempo de recarga da Dança da Lâmina em 1s a cada golpe básico desferido durante o Frenesi.',
          },
        ],
      },
      {
        id: 'red-lady-passive',
        name: 'Corte Arterial',
        type: 'Passiva',
        damageType: 'None',
        description: 'Ataques básicos têm 35% de chance de aplicar Sangramento, causando 45% de dano físico por segundo por 4s (acumula até 5 vezes).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Lâminas Serrilhadas',
            description: 'Chance de aplicar sangramento aumentada para 50%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Banquete de Sangue',
            description: 'Cada inimigo sangrando no campo concede +6% de Ataque e +5% de Defesa à Red Lady.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Hemorragia Severa',
            description: 'Ao atingir acúmulo máximo de sangramento, reduz a defesa física do alvo em 25%.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Aura Vampírica',
            description: 'Aumenta o Roubo de Vida base de toda a equipe em 8%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Explosão Arterial',
            description: 'Ao acumular 5 sangramentos, explode causando 15% da vida máxima do alvo como dano verdadeiro.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=red-lady',
      shardsUrl: '/calculadoras?tab=shards&hero=red-lady',
      badgesUrl: '/calculadoras?tab=badges&hero=red-lady',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/red-lady',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 6. BILLY (UR)
  // =========================================================================
  {
    id: 'billy',
    name: 'Billy',
    slug: 'billy',
    title: 'O Artilheiro Demolidor',
    rarity: 'UR',
    faction: 'Ranger',
    role: 'Carry',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/billy-full-image-300x289.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/billy-full-image-300x289.webp',
    bio: 'Billy não economiza pólvora nem estilhaços. Equipado com canhões de ombro e morteiros de alta fragmentação, ele bombardeia formações inteiras destruindo armaduras pesadas e limpando aglomerações com dano físico massivo.',
    lore: 'Mecânico de veículos blindados que adaptou peças de tanques destruídos em um exoesqueleto de artilharia pesada capaz de disparar munições incendiárias contínuas.',
    quote: 'Se não explodiu na primeira vez, use uma ogiva maior!',
    tier: 'S',
    combatProfile: {
      tags: ['AoE', 'Physical Damage', 'Armor Break', 'Ranger', 'Carry', 'Backline', 'Knockback'],
      position: 'Backline',
      pros: [
        'Dano físico de área (AoE) avassalador',
        'Quebra de armadura pesada em massa facilitando dano físico de todo o time',
        'Supressão de aglomerações e empurrão tático',
      ],
      cons: [
        'Velocidade de ataque mais lenta que a média de Rangers',
        'Tempo de recarga longo nas habilidades principais',
      ],
      synergyWith: ['annie', 'zoya', 'marlena', 'arthur'],
      counteredBy: ['bell', 'shadow'],
      bestFormation: 'Linha traseira central para permitir que a dispersão dos morteiros atinja todo o esquadrão inimigo.',
      recommendedPositioningNote: 'Posição 4 da retaguarda com visão aberta.',
    },
    unlockInfo: {
      serverDay: 22,
      methods: ['Hero Pass Temporada 4', 'Invocação Especial de Artilharia', 'Pacotes da Loja'],
      laterMethods: ['Recrutamento da Taberna'],
      notes: 'Liberado no Dia 22 do servidor no Hero Pass de Temporada 4. A peça-chave para formações de dano físico em área.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'billy-ult',
        name: 'Bombardeio em Massa',
        type: 'Ultimate',
        cooldown: '18s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Dispara 4 ogivas pesadas que caem sobre todo o campo inimigo, causando 420% de Dano Físico e rompendo 35% da Armadura de todos os atingidos por 6s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Salva Aumentada',
            description: 'Dano aumentado para 500% de Dano Físico.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Estilhaços Perfurantes',
            description: 'Rompimento de armadura aumentado para 45%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Solo em Chamas',
            description: 'O impacto deixa crateras em chamas por 5s, causando 40% de dano físico residual por segundo.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Fogo Concentrado',
            description: 'Causa +35% de dano contra formações que tenham 3 ou mais heróis vivos.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Devastação Total',
            description: 'Atordoa todos os alvos atingidos por 2s e ignora 50% da armadura total do time inimigo.',
          },
        ],
      },
      {
        id: 'billy-active',
        name: 'Granada de Fragmentação',
        type: 'Ativa',
        cooldown: '11s',
        damageType: 'Physical',
        description: 'Arremessa um explosivo de estilhaços na linha de frente inimiga causando 210% de Dano Físico e empurrando os tanques para trás (Knockback).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Carga Duplicada',
            description: 'Dano aumentado para 260%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Onda Supressora',
            description: 'Aplica lentidão de 40% na movimentação dos alvos por 4s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Raio Expandido',
            description: 'Aumenta o raio de explosão em 50%, atingindo a linha média adversária.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Estilhaço Cego',
            description: 'Reduz o ataque dos inimigos atingidos em 20% por 5s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Fogo Cruzado',
            description: 'Dispara duas granadas simultâneas em alvos diferentes.',
          },
        ],
      },
      {
        id: 'billy-passive',
        name: 'Municiamento Pesado',
        type: 'Passiva',
        damageType: 'None',
        description: 'Ataques básicos de Billy causam 40% de Dano Splash em área circular ao redor do alvo principal.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Calibre Espalhado',
            description: 'Dano splash aumentado para 60% do ataque principal.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Pólvora Brutal',
            description: 'Aumenta o Dano Físico de Billy em 22% permanentemente.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Micro-perfuração',
            description: 'Ataques básicos têm 25% de chance de causar quebra de armadura menor (15%).',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Munição Coletiva',
            description: 'Concede +15% de Dano Físico em área para todos os Rangers aliados.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Recarga Tática de Abate',
            description: 'Ao matar um inimigo com qualquer habilidade, Billy recarrega 400 de energia instantaneamente.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=billy',
      shardsUrl: '/calculadoras?tab=shards&hero=billy',
      badgesUrl: '/calculadoras?tab=badges&hero=billy',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/billy',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 7. CYNTHIA (UR)
  // =========================================================================
  {
    id: 'cynthia',
    name: 'Cynthia',
    slug: 'cynthia',
    title: 'A Curandeira Biocatalítica',
    rarity: 'UR',
    faction: 'Warlock',
    role: 'Support',
    damageType: 'Energy',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/cynthia-full-image-247x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/cynthia-full-image-247x300.webp',
    bio: 'Cynthia é a mestra suprema da regeneração biológica e restauração celular. Com infusões medicinais avançadas e campos purificadores de bioenergia, ela restaura a vida do time inteiro e limpa todas as maldições, sangramentos e venenos.',
    lore: 'Médica pesquisadora do complexo científico, Cynthia decodificou a estrutura genética da praga para criar antídotos celulares imediatos em pleno combate.',
    quote: 'Nenhuma ferida é mortal se eu estiver no campo de batalha.',
    tier: 'S+',
    combatProfile: {
      tags: ['Heal', 'Cleanse', 'Support', 'Energy Damage', 'Buff', 'Sustain', 'Warlock'],
      position: 'Backline',
      pros: [
        'Maior potência de cura pura do jogo para todo o time',
        'Purificação completa de efeitos negativos e debuffs (Cleanse)',
        'Habilidade de salvar aliados de golpes fatais com escudos de emergência',
      ],
      cons: [
        'Dano ofensivo muito baixo',
        'Alvo primário de assassinos adversários como Bell e Shadow',
      ],
      synergyWith: ['marlena', 'zoya', 'nicole', 'red-lady'],
      counteredBy: ['bell', 'shadow', 'daskal'],
      bestFormation: 'Posição mais protegida da retaguarda, cercada por guerreiros ou suportes defensivos.',
      recommendedPositioningNote: 'Posicione no canto mais recuado e longe dos assassinos inimigos.',
    },
    unlockInfo: {
      serverDay: 29,
      methods: ['Hero Pass Temporada 5', 'Pacotes da Loja de Suporte'],
      laterMethods: ['Recrutamento da Taberna', 'Oferta Diária'],
      notes: 'Desbloqueia no Dia 29 de servidor no Hero Pass. A suporte definitiva de sustentação e cura para os desafios mais difíceis.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'cynthia-ult',
        name: 'Graça Biocatalítica',
        type: 'Ultimate',
        cooldown: '16s',
        energyCost: 1000,
        damageType: 'Energy',
        description: 'Canaliza uma torrente de luz restauradora curando instantaneamente todos os heróis aliados em 320% de seu Poder de Cura e dissipando todos os efeitos negativos (Cleanse).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Restauração Profunda',
            description: 'Cura aumentada para 400% do Poder de Cura.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Regeneração Celular',
            description: 'Aliados curados recebem Regeneração contínua de 5% de HP por segundo por 4s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Purificação Inabalável',
            description: 'Concede Imunidade a Efeitos de Controle (CC) por 3s após a purificação.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Bênção de Titânio',
            description: 'Reduz o tempo de recarga da Graça em 3s e aumenta a Defesa de todos os aliados em 20%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Milagre da Vida',
            description: 'Previne a morte de um aliado fatalmente ferido, restaurando 40% do seu HP instantaneamente (1x por combate).',
          },
        ],
      },
      {
        id: 'cynthia-active',
        name: 'Escudo Purificador',
        type: 'Ativa',
        cooldown: '10s',
        damageType: 'Energy',
        description: 'Aplica um escudo de bioenergia no aliado com menor porcentagem de vida equivalente a 25% do HP máximo de Cynthia por 6s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Bio-barreira',
            description: 'Escudo aumentado para 32% do HP de Cynthia.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Estímulo Adrenal',
            description: 'Enquanto o escudo estiver ativo, o portador recebe +25% de Velocidade de Ataque.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Escudo Duplo',
            description: 'O escudo agora é aplicado nos 2 aliados mais feridos simultaneamente.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Refração Curativa',
            description: 'Reflete 30% do dano recebido de volta para o atacante.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Absorção Restauradora',
            description: 'Ao quebrar ou expirar, cura o portador em 100% do valor restante do escudo.',
          },
        ],
      },
      {
        id: 'cynthia-passive',
        name: 'Presença Reconfortante',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta passivamente a Resistência a Danos de todos os aliados em 12% e o Poder de Cura de Cynthia em 20%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Aura da Serenidade',
            description: 'Resistência a Danos aumentada para 16%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Amortecimento Vital',
            description: 'Reduz o dano de acertos críticos sofridos por todos os aliados em 20%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Revitalização Energética',
            description: 'Aliados curados por Cynthia ganham 100 de energia imediatamente.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Vitalidade do Asilo',
            description: 'Aumenta o HP Máximo de toda a equipe em 15%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Imunidade Médica',
            description: 'Cynthia torna-se permanentemente imune a efeitos de Silêncio e Redução de Energia.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=cynthia',
      shardsUrl: '/calculadoras?tab=shards&hero=cynthia',
      badgesUrl: '/calculadoras?tab=badges&hero=cynthia',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/cynthia',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 8. ZOYA (UR)
  // =========================================================================
  {
    id: 'zoya',
    name: 'Zoya',
    slug: 'zoya',
    title: 'A Conquistadora Sísmica',
    rarity: 'UR',
    faction: 'Warrior',
    role: 'Tank',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/zoya-full-image-281x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/zoya-full-image-281x300.webp',
    bio: 'Zoya é um tanque ultra-ofensivo que não apenas aguenta dano massivo, mas quebra a formação adversária com impactos sísmicos e atordoamentos em cadeia. Ela é a ponta de lança definitiva contra times defensivos.',
    lore: 'Lutadora clandestina das arenas subterrâneas, Zoya adaptou marretas pneumáticas de mineração em armas de guerra para esmagar as carapaças dos infectados.',
    quote: 'Vou esmagar suas defesas até não sobrar pó.',
    tier: 'S+',
    combatProfile: {
      tags: ['Tank', 'Crowd Control', 'Stun', 'Def Buff', 'Warrior', 'Disruption', 'Frontline'],
      position: 'Frontline',
      pros: [
        'Controle de grupo devastador com atordoamento em área (AoE Stun)',
        'Destruição e quebra de escudos inimigos',
        'Excelente geração de escudo próprio baseada no número de alvos atingidos',
      ],
      cons: [
        'Depende de acertar o impacto no agrupamento inimigo',
        'Consumo e exigência de energia altos',
      ],
      synergyWith: ['billy', 'nicole', 'red-lady', 'bell'],
      counteredBy: ['cynthia', 'harper'],
      bestFormation: 'Posição frontal 1 ou 2 para absorver a investida e saltar direto no centro das linhas adversárias.',
      recommendedPositioningNote: 'Linha de frente ofensiva ao lado de outro guerreiro.',
    },
    unlockInfo: {
      serverDay: 36,
      methods: ['Hero Pass Temporada 6', 'Pacotes de Invocação Sísmica'],
      laterMethods: ['Recrutamento da Taberna'],
      notes: 'Disponível a partir do Dia 36 no Hero Pass. Um dos tanques mais agressivos e dominantes do meta de PvP.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'zoya-ult',
        name: 'Impacto Sísmico',
        type: 'Ultimate',
        cooldown: '17s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Salta violentamente no epicentro da tropa inimiga, causando 360% de Dano Físico e Atordoando (Stun) todos os inimigos no raio de impacto por 2.5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Terremoto Devastador',
            description: 'Duração do atordoamento aumentada para 3.2s.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Quebra de Barreira',
            description: 'Dano aumentado para 440% e destrói 30% dos escudos inimigos.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Escudo Sísmico',
            description: 'Ganha um Escudo de 12% de HP para cada inimigo atordoado pelo impacto por 6s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Tenacidade Inabalável',
            description: 'Reduz o tempo de recarga da Ultimate em 3s e aumenta a Tenacidade em 30%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Cataclismo Bélico',
            description: 'Destrói 100% dos escudos de todos os inimigos atingidos e bloqueia o ganho de energia dos alvos por 4s.',
          },
        ],
      },
      {
        id: 'zoya-active',
        name: 'Investida Rompedora',
        type: 'Ativa',
        cooldown: '10s',
        damageType: 'Physical',
        description: 'Avança em linha reta empurrando o tanque inimigo para trás, causando 220% de Dano Físico e reduzindo o Ataque do alvo em 25% por 5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Empurrão Brutal',
            description: 'Dano aumentado para 270%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Derrubada Tática',
            description: 'Derruba os inimigos em sua trajetória, aplicando atordoamento de 1.5s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Roubo de Defesa',
            description: 'Redução de ataque aumentada para 35% e rouba 10% da defesa do alvo para si.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Carga Vigorosa',
            description: 'Gera 200 de energia instantaneamente ao atingir o alvo principal.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Golpe Demolidor',
            description: 'Causa dano adicional equivalente a 12% do HP máximo do alvo.',
          },
        ],
      },
      {
        id: 'zoya-passive',
        name: 'Carapaça Blindada',
        type: 'Passiva',
        damageType: 'None',
        description: 'Reduz o dano físico sofrido em 25%, aumenta a Defesa em 20% e reduz a chance de sofrer acertos críticos em 30%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Couraça de Aço',
            description: 'Redução de Dano Físico aumentada para 32%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Constituição Férrea',
            description: 'HP Máximo aumentado em +25%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Defesa de Vanguarda',
            description: 'Concede +18% de Defesa para todos os aliados posicionados na linha de frente.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Resiliência de Combate',
            description: 'Quando o HP cai abaixo de 50%, ganha 35% de Redução de Dano por 8s (1x por combate).',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Imobilidade Suprema',
            description: 'Imunidade total a efeitos de empurrão (Knockback) e redução de velocidade.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=zoya',
      shardsUrl: '/calculadoras?tab=shards&hero=zoya',
      badgesUrl: '/calculadoras?tab=badges&hero=zoya',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/zoya',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 9. BELL (UR)
  // =========================================================================
  {
    id: 'bell',
    name: 'Bell',
    slug: 'bell',
    title: 'O Ceifador Invisível',
    rarity: 'UR',
    faction: 'Ranger',
    role: 'Carry',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/bell-full-image-285x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/bell-full-image-285x300.webp',
    bio: 'Bell é o pesadelo dos atiradores e feiticeiros de retaguarda. Especialista em furtividade e eliminação cirúrgica de alvos de alto valor com disparos silenciados de precisão letal, ele elimina o carry inimigo antes mesmo de a batalha esquentar.',
    lore: 'Operador de missões de eliminação nas zonas de quarentena, Bell nunca deixou rastros ou testemunhas de suas operações.',
    quote: 'Você nunca ouve o disparo que te mata.',
    tier: 'S+',
    combatProfile: {
      tags: ['Single Target', 'Burst', 'Assassination', 'Physical Damage', 'Ranger', 'Crit', 'True Damage'],
      position: 'Backline',
      pros: [
        'Foco prioritário letal na retaguarda inimiga (ataca heróis frágeis primeiro)',
        'Mecanismo de Camuflagem que o torna completamente inalvejável',
        'Dano Verdadeiro (True Damage) em alvos com pouca vida',
      ],
      cons: [
        'Vida e defesa baixas se descoberto',
        'Dano estritamente focado em alvo único',
      ],
      synergyWith: ['zoya', 'marlena', 'jester', 'annie'],
      counteredBy: ['marlena', 'cynthia'],
      bestFormation: 'Flanco da retaguarda para ativar camuflagem e snipear o carry adversário sem sofrer dano colateral.',
      recommendedPositioningNote: 'Posição lateral extrema da retaguarda.',
    },
    unlockInfo: {
      serverDay: 43,
      methods: ['Hero Pass Temporada 7', 'Invocação Especial Furtiva', 'Pacotes da Loja'],
      laterMethods: ['Recrutamento da Taberna'],
      notes: 'Desbloqueia no Dia 43 no Hero Pass. O assassino definitivo de longo alcance para neutralizar Nicolle, Cynthia ou Annie no PvP.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'bell-ult',
        name: 'Tiro Fatal Silencioso',
        type: 'Ultimate',
        cooldown: '15s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Mera a longa distância e dispara uma bala de titânio no inimigo com menor HP, causando 580% de Dano Físico (+1% de dano extra para cada 1% de HP perdido pelo alvo).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Disparo de Precisão',
            description: 'Dano base aumentado para 660%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Impacto Perfurante',
            description: 'Dano Crítico deste disparo aumentado em +50%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Execução Verdadeira',
            description: 'Causa Dano Verdadeiro (True Damage) que ignora 100% da armadura se o alvo estiver abaixo de 35% de vida.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Reabastecimento Rápido',
            description: 'Ao abater o alvo, recupera 500 de Energia instantaneamente e entra em Camuflagem por 3s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Ceifador Tático',
            description: 'Se o Tiro Fatal eliminar o alvo, a habilidade é resetada com 100% de poder imediatamente (máx. 2 resets consecutivos).',
          },
        ],
      },
      {
        id: 'bell-active',
        name: 'Manto de Camuflagem',
        type: 'Ativa',
        cooldown: '11s',
        damageType: 'Physical',
        description: 'Ativa camuflagem óptica tornando-se inalvejável por 4.5s e aumentando sua Taxa de Crítico em 40% e Velocidade de Movimento em 30%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Furtividade Prolongada',
            description: 'Duração da camuflagem aumentada para 6s.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Ataque de Emboscada',
            description: 'O primeiro ataque desferido ao sair da camuflagem causa 250% de dano crítico adicional.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Dissipação Furtiva',
            description: 'Dissipa todos os debuffs e status negativos ao entrar na camuflagem.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Penetração Óptica',
            description: 'Ganha 25% de penetração de armadura passiva durante a camuflagem.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Manto do Assassino',
            description: 'Reduz o tempo de recarga desta habilidade em 4s ao abater qualquer inimigo.',
          },
        ],
      },
      {
        id: 'bell-passive',
        name: 'Munição Perfurante',
        type: 'Passiva',
        damageType: 'None',
        description: 'Todos os ataques de Bell ignoram passivamente 30% da Armadura Física do alvo e aumentam o Dano Crítico em 25%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Ponta de Tungstênio',
            description: 'Penetração de armadura aumentada para 38%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Letalidade Focada',
            description: 'Dano Crítico aumentado para +40%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Ferida Profunda',
            description: 'Ataques críticos aplicam Ferida Profunda (-50% de regeneração de vida no alvo por 5s).',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Instinto de Franco-Atirador',
            description: 'Concede +12% de Taxa Crítica para todos os Rangers da equipe.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Fim da Linha',
            description: 'Ataques básicos contra alvos abaixo de 50% de vida causam 30% de dano adicional.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=bell',
      shardsUrl: '/calculadoras?tab=shards&hero=bell',
      badgesUrl: '/calculadoras?tab=badges&hero=bell',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/bell',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 10. HARPER (UR)
  // =========================================================================
  {
    id: 'harper',
    name: 'Harper',
    slug: 'harper',
    title: 'A Senhora das Tempestades de Plasma',
    rarity: 'UR',
    faction: 'Warlock',
    role: 'Carry',
    damageType: 'Energy',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/harper-full-image-296x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/harper-full-image-296x300.webp',
    bio: 'Harper comanda as forças eletromagnéticas do apocalipse. Com relâmpagos em cadeia e campos de plasma paralisantes, ela controla e desteça as fileiras oponentes, impedindo que conjuradores e guerreiros usem suas habilidades.',
    lore: 'Engenheira de redes de energia que dominou o confinamento de plasma após o colapso dos reatores nucleares do setor central.',
    quote: 'A eletricidade não tem piedade dos que resistem.',
    tier: 'S+',
    combatProfile: {
      tags: ['AoE', 'Energy Damage', 'Paralysis', 'Crowd Control', 'Warlock', 'Carry', 'Silence'],
      position: 'Backline',
      pros: [
        'Paralisia em cadeia que imobiliza equipes inteiras',
        'Dano elemental de área contínuo extremo',
        'Efeito de Silêncio e Queima de Mana que anula combos inimigos',
      ],
      cons: [
        'Fragilidade contra dano físico concentrado',
        'Canalização da Ultimate pode ser interrompida se mal posicionada',
      ],
      synergyWith: ['nicole', 'jester', 'marlena', 'zoya'],
      counteredBy: ['bell', 'annie'],
      bestFormation: 'Posição central da retaguarda para cobrir toda a extensão do mapa com a tempestade de plasma.',
      recommendedPositioningNote: 'Linha traseira central protegida por defensores pesados.',
    },
    unlockInfo: {
      serverDay: 50,
      methods: ['Hero Pass Temporada 8', 'Pacotes de Invocação de Plasma'],
      laterMethods: ['Recrutamento da Taberna'],
      notes: 'Lançada no Dia 50 no Hero Pass de elite. Uma das forças mais dominantes do late-game para o meta elemental.',
      isAvailableDay1: false,
    },
    skills: [
      {
        id: 'harper-ult',
        name: 'Tempestade de Plasma',
        type: 'Ultimate',
        cooldown: '16s',
        energyCost: 1000,
        damageType: 'Energy',
        description: 'Convoca uma tempestade elétrica sobre toda a arena inimiga, causando 420% de Dano de Energia e aplicando Choque Paralisante por 3s (alvos não podem atacar nem mover-se).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Voltagem Mortal',
            description: 'Dano aumentado para 500% de Dano de Energia.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Paralisia Estendida',
            description: 'Duração da Paralisia aumentada para 4s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Dreno Iônico',
            description: 'Aplica Sobrecarga que queima 200 pontos de energia de todos os alvos afetados.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Escudo de Plasma',
            description: 'Harper recebe um Escudo Elétrico de 25% de HP durante a conjuração.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Hipertempestade Iônica',
            description: 'Causa 50% de dano adicional e Silencia todas as habilidades inimigas por toda a duração da tempestade.',
          },
        ],
      },
      {
        id: 'harper-active',
        name: 'Relâmpago em Cadeia',
        type: 'Ativa',
        cooldown: '9s',
        damageType: 'Energy',
        description: 'Dispara um raio de alta voltagem que salta entre até 4 inimigos, causando 230% de Dano de Energia no primeiro alvo e reduzindo a Defesa de Energia em 25% por 5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Condução Ampliada',
            description: 'Salta entre até 6 inimigos sem perda de dano.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Ruptura Magnética',
            description: 'Redução de Defesa de Energia aumentada para 35%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Choque Estático',
            description: 'Cada salto tem 30% de chance de atordoar o alvo por 1.5s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Centelha Potencializada',
            description: 'Dano aumentado para 290% por alvo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Recarga Eletrostática',
            description: 'Gera 100 de energia para Harper por cada inimigo atingido.',
          },
        ],
      },
      {
        id: 'harper-passive',
        name: 'Sobrecarga Eletrostática',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta o Dano de Energia de Harper em 25% e faz com que todo dano elétrico acumule cargas que explodem ao atingir 3 acúmulos (150% de dano em área).',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Potência Eletrostática',
            description: 'Dano de Energia passivo aumentado para 32%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Pulso Eletromagnético',
            description: 'A explosão da sobrecarga agora atordoa alvos por 1s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Ressonância Arcana',
            description: 'Aumenta o Dano de Energia de todos os heróis Feiticeiros aliados em 18%.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Interferência Magnética',
            description: 'Inimigos sob choque perdem 25% de velocidade de ataque.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Centelha Inicial',
            description: 'Ao iniciar o combate, dispara imediatamente um Relâmpago em Cadeia sem custo de recarga.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=harper',
      shardsUrl: '/calculadoras?tab=shards&hero=harper',
      badgesUrl: '/calculadoras?tab=badges&hero=harper',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/harper',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 11. BRIAN (SSR)
  // =========================================================================
  {
    id: 'brian',
    name: 'Brian',
    slug: 'brian',
    title: 'O Guarda de Ferro da Infantaria',
    rarity: 'SSR',
    faction: 'Warrior',
    role: 'Tank',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/brian-full-image-292x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/brian-full-image-292x300.webp',
    bio: 'Brian é o pilar inicial de proteção dos sobreviventes. Veterano da infantaria militar, ele protege seus companheiros com táticas sólidas de contenção e barreiras metálicas reforçadas.',
    lore: 'Sargento da linha de defesa perimetral, Brian manteve seu pelotão unido quando as comunicações globais caíram.',
    quote: 'Enquanto eu estiver de pé, ninguém cai!',
    tier: 'A',
    combatProfile: {
      tags: ['Tank', 'Def Buff', 'Physical Damage', 'Frontline', 'Shield', 'Sustain', 'Warrior'],
      position: 'Frontline',
      pros: [
        'Muito fácil de recrutar e evoluir estrelas amarelas e vermelhas',
        'Excelente bônus de defesa para a linha de frente',
        'Boa durabilidade durante toda a fase inicial do servidor',
      ],
      cons: [
        'Atributos máximos inferiores aos tanques UR como Marlena ou Zoya',
        'Menor capacidade de controle de grupo',
      ],
      synergyWith: ['louis', 'shadow', 'arthur', 'marlena'],
      counteredBy: ['nicole', 'billy'],
      bestFormation: 'Primeira linha de frente protegendo os atiradores e curandeiros iniciantes.',
      recommendedPositioningNote: 'Linha frontal centro-esquerda.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['Recrutamento Básico da Taberna', 'Capítulos Iniciais da Campanha', 'Recompensas de Missões'],
      laterMethods: ['Loja de Fragmentos'],
      notes: 'Herói SSR disponível desde o Dia 1. O tanque de entrada mais acessível para montar o primeiro esquadrão.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'brian-ult',
        name: 'Muralha de Aço',
        type: 'Ultimate',
        cooldown: '16s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Gera um escudo protetor equivalente a 28% do HP Máximo e aumenta a Defesa de todos os aliados da linha de frente em 20% por 6s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Escudo Reforçado',
            description: 'Escudo aumentado para 35% do HP Máximo.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Guarda Coletiva',
            description: 'Aumento de Defesa para aliados elevado para 28%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Cobertura de Retaguarda',
            description: 'Concede 10% de redução de dano global para a linha de trás.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Absorção Vigorosa',
            description: 'Recupera 5% de HP ao receber dano enquanto o escudo estiver ativo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Fortaleza Viva',
            description: 'Ao cair abaixo de 20% de vida, fica imune a dano por 2s e restaura 30% de HP.',
          },
        ],
      },
      {
        id: 'brian-active',
        name: 'Impacto Frontal',
        type: 'Ativa',
        cooldown: '10s',
        damageType: 'Physical',
        description: 'Atinge o inimigo mais próximo com o broquel causando 180% de Dano Físico e reduzindo a velocidade de ataque do alvo em 25% por 4s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Golpe Pesado',
            description: 'Dano aumentado para 220%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Contusão Severa',
            description: 'Aplica atordoamento de 1.2s no alvo.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Postura Firme',
            description: 'Aumenta a própria defesa em 15% após o impacto.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Cadência Defensiva',
            description: 'Reduz o tempo de recarga da habilidade em 2s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Impacto Duplo',
            description: 'Atinge os 2 inimigos frontais simultaneamente.',
          },
        ],
      },
      {
        id: 'brian-passive',
        name: 'Treinamento Tático',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta o HP Máximo em 18% e a Resistência a Críticos em 20% permanentemente.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Constituição Militar',
            description: 'HP Máximo aumentado para +25%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Proteção Antibalística',
            description: 'Redução de dano de golpes críticos em 25%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Armadura da Infantaria',
            description: 'Aumenta a armadura física de todos os guerreiros em 10%.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Regeneração Contínua',
            description: 'Regenera 1% de HP por segundo passivamente.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Isolamento Elemental',
            description: 'Ganha 15% de resistência a dano de Energia.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=brian',
      shardsUrl: '/calculadoras?tab=shards&hero=brian',
      badgesUrl: '/calculadoras?tab=badges&hero=brian',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/brian',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 12. LOUIS (SSR)
  // =========================================================================
  {
    id: 'louis',
    name: 'Louis',
    slug: 'louis',
    title: 'O Fuzileiro dos Ermos',
    rarity: 'SSR',
    faction: 'Ranger',
    role: 'Carry',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/louis-full-image-290x300.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/louis-full-image-290x300.webp',
    bio: 'Louis é um atirador ágil e confiável que opera com rifles semiautomáticos de alta cadência. Simples, eficiente e letal para as etapas iniciais e intermediárias da campanha.',
    lore: 'Caçador experiente das terras devastadas, Louis aprendeu a sobreviver mantendo distância segura e economizando cartuchos.',
    quote: 'Mantenham a cadência de fogo e eles não chegam perto.',
    tier: 'A',
    combatProfile: {
      tags: ['Single Target', 'Physical Damage', 'Ranger', 'Carry', 'Attack Speed'],
      position: 'Backline',
      pros: [
        'Fácil evolução e progressão rápida de estrelas',
        'Alta cadência de tiro e dano físico constante',
        'Boa penetração de armadura básica',
      ],
      cons: [
        'Inexistência de habilidades de dano em área',
        'Poder de fogo ultrapassado no late game por Annie ou Bell',
      ],
      synergyWith: ['brian', 'arthur', 'annie'],
      counteredBy: ['shadow', 'marlena'],
      bestFormation: 'Linha traseira com visão direta nos alvos da vanguarda adversária.',
      recommendedPositioningNote: 'Retaguarda superior ou inferior.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['Recrutamento da Taberna', 'Missões Diárias', 'Capítulos da História'],
      laterMethods: ['Loja de Fragmentos'],
      notes: 'Herói SSR disponível desde o Dia 1. O atirador mais fácil de obter no início do jogo.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'louis-ult',
        name: 'Fogo Rápido',
        type: 'Ultimate',
        cooldown: '14s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Descarrega um pente completo de 6 tiros em altíssima cadência no alvo atual, causando 420% de Dano Físico total.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Pente Estendido',
            description: 'Dano total aumentado para 510%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Fogo Concentrado',
            description: 'Aumenta a Taxa Crítica de cada tiro em 20%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Recarga Rápida',
            description: 'Cada acerto crítico durante a Ultimate reduz o tempo de recarga em 1s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Munição Perfurante',
            description: 'Ignora 25% da armadura física do alvo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Chuva de Chumbo',
            description: 'Cada tiro tem 35% de chance de causar dano duplo.',
          },
        ],
      },
      {
        id: 'louis-active',
        name: 'Tiro de Precisão',
        type: 'Ativa',
        cooldown: '9s',
        damageType: 'Physical',
        description: 'Dispara um tiro de alto calibre no inimigo mais distante causando 200% de Dano Físico e aplicando lentidão por 3s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Calibre Pesado',
            description: 'Dano aumentado para 240%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Quebra de Guarda',
            description: 'Aplica quebra de armadura de 15% por 4s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Disparo de Longo Alcance',
            description: 'Garante acerto crítico se o alvo estiver a longa distância.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Mecanismo Leve',
            description: 'Reduz o tempo de recarga da habilidade para 7s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Tiro Neutralizante',
            description: 'Atordoa o alvo atingido por 1.2s.',
          },
        ],
      },
      {
        id: 'louis-passive',
        name: 'Pólvora Aprimorada',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta permanentemente o Ataque em 18% e a Velocidade de Ataque em 15%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Carga Elevada',
            description: 'Ataque aumentado para +24%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Reflexos de Caçador',
            description: 'Velocidade de Ataque aumentada para +22%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Mira Estável',
            description: 'Aumenta o dano em 15% enquanto atacar o mesmo alvo sem interrupção.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Suporte de Artilharia',
            description: 'Concede +8% de Ataque para todos os Rangers aliados.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Estilhaço Residual',
            description: 'Ataques básicos têm 15% de chance de causar mini-explosão em área.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=louis',
      shardsUrl: '/calculadoras?tab=shards&hero=louis',
      badgesUrl: '/calculadoras?tab=badges&hero=louis',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/louis',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 13. SHADOW (SSR)
  // =========================================================================
  {
    id: 'shadow',
    name: 'Shadow',
    slug: 'shadow',
    title: 'O Assassino das Sombras',
    rarity: 'SSR',
    faction: 'Warrior',
    role: 'Carry',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/shadow-full-image-300x245.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/shadow-full-image-300x245.webp',
    bio: 'Shadow é um assassino ágil e silencioso especializado em contornar a linha de frente inimiga para apunhalar suportes e atiradores na retaguarda com lâminas embebidas em veneno corrosivo.',
    lore: 'Infiltrador dos túneis do esgoto, Shadow desenvolveu técnicas de combate em escuridão total para surpreender seus inimigos.',
    quote: 'Antes que você perceba, sua sombra já foi roubada.',
    tier: 'A',
    combatProfile: {
      tags: ['Single Target', 'Burst', 'Bleed', 'Physical Damage', 'Flanker', 'Warrior'],
      position: 'Flexible',
      pros: [
        'Flanqueador nato que salta diretamente na retaguarda oponente',
        'Alto dano crítico inicial de emboscada',
        'Esquiva natural elevada contra ataques físicos',
      ],
      cons: [
        'Vida reduzida em comparação a outros guerreiros',
        'Vulnerável a controle de grupo se não abater rapidamente o alvo',
      ],
      synergyWith: ['daskal', 'louis', 'arthur', 'nicole'],
      counteredBy: ['marlena', 'zoya'],
      bestFormation: 'Flanco lateral para permitir saltar atrás do carry inimigo no primeiro instante.',
      recommendedPositioningNote: 'Posição lateral extrema da formação.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['Recrutamento da Taberna', 'Loja da Arena PvP', 'Pacotes Iniciais'],
      laterMethods: ['Loja de Fragmentos'],
      notes: 'Herói SSR disponível desde o Dia 1. Muito útil na arena inicial para punir formações sem proteção traseira.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'shadow-ult',
        name: 'Golpe Sombrio',
        type: 'Ultimate',
        cooldown: '14s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Teletransporta-se diretamente nas costas do inimigo de menor vida na retaguarda, causando 450% de Dano Físico e aplicando Veneno Corrosivo por 4s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Lâmina Furtiva',
            description: 'Dano aumentado para 520%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Toxina Necrótica',
            description: 'Dano do veneno aumentado em +40%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Fuga Sombria',
            description: 'Ao abater o alvo, ganha invisibilidade temporária por 2.5s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Apunhalada Crítica',
            description: 'Garante Acerto Crítico se atacar pelas costas.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Pesadelo Sombrio',
            description: 'Golpe Sombrio atinge todos os inimigos adjacentes na retaguarda simultaneamente.',
          },
        ],
      },
      {
        id: 'shadow-active',
        name: 'Lâminas Envenenadas',
        type: 'Ativa',
        cooldown: '9s',
        damageType: 'Physical',
        description: 'Desfere dois cortes rápidos envenenados causando 190% de Dano Físico e reduzindo a taxa de cura do alvo em 35% por 5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Corte Duplo',
            description: 'Dano aumentado para 230%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Anti-Cura Severo',
            description: 'Redução de cura aumentada para 50% (Anti-heal severo).',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Frenesi das Sombras',
            description: 'Aumenta a velocidade de ataque de Shadow em 25% por 4s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Hemorragia Tóxica',
            description: 'Aplica sangramento adicional cumulativo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Lâmina Fantasma',
            description: 'O segundo corte ignora 40% da defesa física do alvo.',
          },
        ],
      },
      {
        id: 'shadow-passive',
        name: 'Passo Fantasma',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta a Esquiva em 20% e a Taxa Crítica em 15% permanentemente.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Reflexo Evasivo',
            description: 'Esquiva aumentada para 26%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Foco no Ponto Cego',
            description: 'Taxa Crítica aumentada para 22% e Dano Crítico +25%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Energia Evasiva',
            description: 'Ao esquivar com sucesso, recupera 50 de energia.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Primeiro Sangue',
            description: 'O primeiro ataque na batalha tem 100% de chance de acerto crítico.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Manto das Sombras',
            description: 'Ao entrar no combate, inicia com 30% de Esquiva adicional por 8s.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=shadow',
      shardsUrl: '/calculadoras?tab=shards&hero=shadow',
      badgesUrl: '/calculadoras?tab=badges&hero=shadow',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/shadow',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 14. DASKAL (SSR)
  // =========================================================================
  {
    id: 'daskal',
    name: 'Daskal',
    slug: 'daskal',
    title: 'O Conjurador de Pragas',
    rarity: 'SSR',
    faction: 'Warlock',
    role: 'Support',
    damageType: 'Energy',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/daskal-last-asylum-plague.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/daskal-last-asylum-plague.webp',
    bio: 'Daskal é um feiticeiro da praga que mina a resistência dos inimigos com maldições profundas, enfraquecendo suas defesas e facilitando abates rápidos para aliados mágicos e físicos.',
    lore: 'Alquimista herético que coletou esporos infectados nas ruínas para criar poções de enfraquecimento orgânico.',
    quote: 'A praga não discrimina. Todos enfraquecem diante dela.',
    tier: 'A',
    combatProfile: {
      tags: ['Support', 'Debuff', 'Def Reduction', 'Energy Damage', 'Warlock', 'Curse'],
      position: 'Backline',
      pros: [
        'Redução brutal de defesa em área',
        'Excelente amplificador de dano elemental para a equipe',
        'Fácil de recrutar e evoluir estrelas rapidamente',
      ],
      cons: [
        'Dano individual moderado',
        'Pouca resistência sob pressão direta',
      ],
      synergyWith: ['nicole', 'harper', 'shadow', 'marlena'],
      counteredBy: ['cynthia', 'bell'],
      bestFormation: 'Retaguarda ao lado de Nicole para maximizar a quebra de defesa elemental nos alvos.',
      recommendedPositioningNote: 'Linha traseira próxima aos carries de Energia.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['Recrutamento da Taberna', 'Trocas de Fragmentos', 'Pacotes Iniciais'],
      laterMethods: ['Loja de Fragmentos'],
      notes: 'Herói SSR disponível desde o Dia 1. O suporte de enfraquecimento elemental mais acessível no início do jogo.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'daskal-ult',
        name: 'Maldição da Praga',
        type: 'Ultimate',
        cooldown: '16s',
        energyCost: 1000,
        damageType: 'Energy',
        description: 'Lança uma névoa infecciosa sobre todo o esquadrão inimigo causando 240% de Dano de Energia e reduzindo a Defesa Geral e a Recuperação de Energia em 25% por 6s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Névoa Corrosiva',
            description: 'Redução de Defesa aumentada para 32%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Infecção Duradoura',
            description: 'Duração da névoa aumentada para 8s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Bloqueio de Escudos',
            description: 'Inimigos na névoa tóxica não podem receber escudos protetores.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Ciclo Malévolo',
            description: 'Reduz o tempo de recarga da Maldição em 3s.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Praga Terminal',
            description: 'Quando a Maldição da Praga expira, explode causando 250% de Dano de Energia acumulado.',
          },
        ],
      },
      {
        id: 'daskal-active',
        name: 'Orbe Corrosivo',
        type: 'Ativa',
        cooldown: '9s',
        damageType: 'Energy',
        description: 'Dispara um orbe tóxico no tanque inimigo causando 190% de Dano de Energia e reduzindo seu ataque em 20% por 4s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Orbe Tóxico',
            description: 'Dano aumentado para 230%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Lentidão Virulenta',
            description: 'Aplica lentidão de 30% na velocidade de ataque do alvo.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Explosão de Esporos',
            description: 'O orbe explode ao impactar, atingindo inimigos adjacentes.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Corrosão Focada',
            description: 'Reduz a defesa do alvo em 15% adicional.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Dreno de Vitalidade',
            description: 'Drena 100 pontos de energia do alvo principal.',
          },
        ],
      },
      {
        id: 'daskal-passive',
        name: 'Aura Enfraquecedora',
        type: 'Passiva',
        damageType: 'None',
        description: 'Inimigos em campo têm seu Ataque reduzido passivamente em 10% e sofrem 10% a mais de Dano de Energia.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Presença Pútrida',
            description: 'Redução de Ataque aumentada para 14%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Sensibilidade Elemental',
            description: 'Amplificação de Dano de Energia aumentada para 16%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Letargia Tóxica',
            description: 'Reduz a velocidade de ataque dos inimigos em 12%.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Ressonância dos Feiticeiros',
            description: 'Aumenta o Poder de Energia de todos os Feiticeiros aliados em 12%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Último Suspiro da Praga',
            description: 'Ao morrer, aplica Maldição da Praga automaticamente em todos os inimigos por 6s.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=daskal',
      shardsUrl: '/calculadoras?tab=shards&hero=daskal',
      badgesUrl: '/calculadoras?tab=badges&hero=daskal',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/daskal',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },

  // =========================================================================
  // 15. ARTHUR (SSR)
  // =========================================================================
  {
    id: 'arthur',
    name: 'Arthur',
    slug: 'arthur',
    title: 'O Comandante da Vanguarda',
    rarity: 'SSR',
    faction: 'Warrior',
    role: 'Support',
    damageType: 'Physical',
    avatarUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/arthur-last-asylum-plague.webp',
    fullImageUrl: 'https://lastasylumplague.com/wp-content/uploads/2026/03/arthur-last-asylum-plague.webp',
    bio: 'Arthur é um líder militar nato que comanda as fileiras de combate. Com ordens táticas precisas, gritos de guerra inspiradores e postura inabalável, ele fortalece todos os companheiros guerreiros e atiradores da equipe.',
    lore: 'Capitão que liderou a retirada estratégica das tropas no início do cataclismo, reorganizando os sobreviventes em batalhões de resistência.',
    quote: 'Mantenham as linhas firmes! Pela sobrevivência da humanidade!',
    tier: 'A',
    combatProfile: {
      tags: ['Support', 'Buff', 'Warrior', 'Physical Damage', 'Morale', 'Frontline', 'Def Buff'],
      position: 'Frontline',
      pros: [
        'Excelente buff de ataque e velocidade para toda a equipe',
        'Aumenta a tenacidade e defesa dos heróis guerreiros',
        'Suporte robusto e resistente que aguenta a linha de frente',
      ],
      cons: [
        'Dano individual moderado',
        'Não possui habilidades de cura direta',
      ],
      synergyWith: ['brian', 'marlena', 'red-lady', 'louis', 'annie'],
      counteredBy: ['jester', 'daskal'],
      bestFormation: 'Linha de frente ao lado de tanques ou guerreiros DPS para amplificar a eficácia em combate.',
      recommendedPositioningNote: 'Linha de frente na posição de suporte tático.',
    },
    unlockInfo: {
      serverDay: 1,
      methods: ['Recrutamento da Taberna', 'Loja da Aliança', 'Pacotes Iniciais'],
      laterMethods: ['Loja de Fragmentos'],
      notes: 'Herói SSR disponível desde o Dia 1. O suporte tático indispensável para formações de Guerreiros.',
      isAvailableDay1: true,
    },
    skills: [
      {
        id: 'arthur-ult',
        name: 'Grito de Guerra Comandante',
        type: 'Ultimate',
        cooldown: '16s',
        energyCost: 1000,
        damageType: 'Physical',
        description: 'Solta um brado de batalha inspirador, aumentando o Ataque de todos os heróis aliados em 25% e a Velocidade de Movimento em 30% por 8s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Voz de Comando',
            description: 'Bônus de Ataque aumentado para 32%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Moral Inabalável',
            description: 'Duração do Grito de Guerra aumentada para 10s.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Tenacidade Heroica',
            description: 'Concede 20% de Tenacidade (resistência a controle de grupo) para todos os aliados.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Fôlego de Batalha',
            description: 'Aliados sob Grito de Guerra regeneram 2.5% de HP por segundo.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Comando Supremo',
            description: 'Reduz instantaneamente em 30% o tempo de recarga de todas as habilidades ativas dos aliados.',
          },
        ],
      },
      {
        id: 'arthur-active',
        name: 'Golpe de Estandarte',
        type: 'Ativa',
        cooldown: '10s',
        damageType: 'Physical',
        description: 'Crava o estandarte de batalha causando 190% de Dano Físico aos inimigos próximos e aumentando a Defesa dos aliados da frente em 15% por 5s.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Estandarte Firme',
            description: 'Dano aumentado para 230%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Guarda da Bandeira',
            description: 'Bônus de Defesa aumentado para 22%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Impacto Atordoante',
            description: 'Atordoa os inimigos na área de impacto por 1.2s.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Inspiração da Vanguarda',
            description: 'Gera 100 de energia para todos os heróis da linha de frente.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Fúria da Bandeira',
            description: 'Aumenta o Dano Crítico dos aliados em 20% na área ao redor do estandarte.',
          },
        ],
      },
      {
        id: 'arthur-passive',
        name: 'Estandarte da Coragem',
        type: 'Passiva',
        damageType: 'None',
        description: 'Aumenta permanentemente a Defesa de todos os aliados em 10% e o HP Máximo de Arthur em 18%.',
        progression: [
          {
            starLevel: '2★',
            starsRequired: 2,
            title: 'Bastião Moral',
            description: 'Bônus de Defesa para aliados aumentado para 15%.',
          },
          {
            starLevel: '4★',
            starsRequired: 4,
            title: 'Constituição de Aço',
            description: 'HP de Arthur aumentado para +25%.',
          },
          {
            starLevel: '6★ (🔴1)',
            starsRequired: 6,
            title: 'Liderança dos Guerreiros',
            description: 'Guerreiros aliados recebem +12% de Dano Físico adicional.',
          },
          {
            starLevel: '8★ (🔴3)',
            starsRequired: 8,
            title: 'Amortecimento de Impacto',
            description: 'Reduz o dano de acertos críticos sofridos pela equipe em 15%.',
          },
          {
            starLevel: '10★ (🔴5)',
            starsRequired: 10,
            title: 'Legião Indomável',
            description: 'Arthur ganha 30% de resistência a dano quando houver 3 ou mais guerreiros em campo.',
          },
        ],
      },
    ],
    calculatorLinks: {
      antitoxinUrl: '/calculadoras?tab=antitoxin&hero=arthur',
      shardsUrl: '/calculadoras?tab=shards&hero=arthur',
      badgesUrl: '/calculadoras?tab=badges&hero=arthur',
    },
    sourceUrls: [
      'https://lastasylumplague.com/heroes/arthur',
      'https://lastasylumplague.com/database/heroes-upgrade-requirements-antitoxins-stars-skill-badges/',
    ],
    lastVerifiedAt: '2026-08-23',
  },
];



