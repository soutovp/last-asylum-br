/**
 * Last Asylum BR - Ponte de Compatibilidade de Heróis
 * Conecta a base de dados oficial HEROES_DATA aos componentes de visualização.
 */

import { HEROES_DATA, Hero as OfficialHero, HeroSkill as OfficialSkill } from '../data/heroes';

export type CompatibleHeroSkill = OfficialSkill & {
  effectLevels: Record<string, string>;
};

export type Hero = Omit<OfficialHero, 'skills'> & {
  unlockDay: number;
  image: string;
  specialty: string;
  tags: string[];
  methods: string[];
  skills: CompatibleHeroSkill[];
};

export const heroes: Hero[] = HEROES_DATA.map((h) => {
  const mappedSkills: CompatibleHeroSkill[] = h.skills.map((s: OfficialSkill) => {
    const star2 = s.progression?.find((p) => p.starsRequired === 2)?.description;
    const star4 = s.progression?.find((p) => p.starsRequired === 4)?.description;
    const star6 = s.progression?.find((p) => p.starsRequired === 6)?.description;
    const star8 = s.progression?.find((p) => p.starsRequired === 8)?.description;
    const star10 = s.progression?.find((p) => p.starsRequired === 10)?.description;

    return {
      ...s,
      effectLevels: {
        '1★': s.description,
        '2★': star2 || s.description,
        '4★': star4 || s.description,
        '5★': star4 || s.description,
        '6★': star6 || s.description,
        '🔴1': star6 || s.description,
        '8★': star8 || s.description,
        '🔴3': star8 || s.description,
        '10★': star10 || s.description,
        '🔴5': star10 || s.description,
      },
    };
  });

  return {
    ...h,
    unlockDay: h.unlockInfo.serverDay,
    image: h.avatarUrl,
    specialty: h.title,
    tags: h.combatProfile.tags,
    methods: h.unlockInfo.methods,
    skills: mappedSkills,
  };
});
