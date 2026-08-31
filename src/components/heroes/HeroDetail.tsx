"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Hero,
  getFactionLabel,
  getRoleLabel,
  getDamageTypeLabel,
  getRarityBadgeColor,
  getFactionBadgeColor,
  getRoleBadgeColor,
  getRelatedHeroes,
  getAllHeroes,
  fetchHeroesAsync,
  formatStarLabel,
  sanitizeUrl,
  sanitizeSlug,
  HEROES_DATA,
} from "@/lib/heroes";
import { SocialShareBar } from "@/components/SocialShareBar";

interface HeroDetailProps {
  hero: Hero;
  initialAllHeroes?: Hero[];
}

export default function HeroDetail({ hero, initialAllHeroes = [] }: HeroDetailProps) {
  const [currentHero, setCurrentHero] = useState<Hero>(hero);
  const [allHeroes, setAllHeroes] = useState<Hero[]>(initialAllHeroes.length > 0 ? initialAllHeroes : HEROES_DATA);
  const [selectedStar, setSelectedStar] = useState<number>(1);

  // Sincronização e Hidratação Reativa do Herói no Cliente após a montagem do componente
  useEffect(() => {
    const handleUpdate = () => {
      const freshHeroes = getAllHeroes();
      setAllHeroes(freshHeroes);
      const fresh = freshHeroes.find((h) => h.id === hero.id || h.slug === hero.slug);
      if (fresh) setCurrentHero(fresh);
    };

    window.addEventListener("heroes_updated", handleUpdate);
    fetchHeroesAsync().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setAllHeroes(fetched);
        const fetchUpdated = fetched.find((h) => h.id === hero.id || h.slug === hero.slug);
        if (fetchUpdated) setCurrentHero(fetchUpdated);
      }
    });

    return () => {
      window.removeEventListener("heroes_updated", handleUpdate);
    };
  }, [hero.id, hero.slug]);

  const relatedHeroes = useMemo(() => {
    return getRelatedHeroes(currentHero, 6, allHeroes);
  }, [currentHero, allHeroes]);
  const factionLabel = getFactionLabel(currentHero.faction);
  const roleLabel = getRoleLabel(currentHero.role);
  const damageTypeLabel = getDamageTypeLabel(currentHero.damageType);
  const isDay1 = currentHero.unlockInfo.serverDay === 1;

  // Coletar dinamicamente as opções de estrelas das habilidades
  const availableStarLevels = useMemo(() => {
    const stars = new Set<number>();
    stars.add(1); // Nível base sempre disponível
    currentHero.skills.forEach(skill => {
      skill.progression?.forEach(p => stars.add(p.starsRequired));
    });
    return Array.from(stars).sort((a, b) => a - b);
  }, [currentHero]);

  // Estrela ativa calculada com segurança sem acionar setState dentro de effect
  const activeStar = availableStarLevels.includes(selectedStar) ? selectedStar : 1;

  const getSkillEffectForStar = (skill: Hero["skills"][0], star: number): string => {
    if (star === 1 || !skill.progression || skill.progression.length === 0) {
      return skill.description;
    }

    const match = skill.progression.find((p) => p.starsRequired === star);
    if (match) return match.description;

    const unlocked = skill.progression
      .filter((p) => p.starsRequired <= star)
      .sort((a, b) => b.starsRequired - a.starsRequired);

    return unlocked.length > 0 ? unlocked[0].description : skill.description;
  };

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case "Frontline":
        return "Linha de Frente (Vanguarda)";
      case "Backline":
        return "Linha de Trás (Retaguarda)";
      case "Flexible":
        return "Posicionamento Flexível";
      default:
        return pos;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* NAVEGAÇÃO BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="text-sm text-slate-400 flex items-center gap-2">
        <Link href="/" className="hover:text-[#00ff88] transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link href="/herois" className="hover:text-[#00ff88] transition-colors">
          Central de Heróis
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{currentHero.name}</span>
      </nav>

      {/* CABEÇALHO DO HERÓI */}
      <div className="bg-[#101623]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ff88]/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-900 rounded-2xl flex-shrink-0 border-2 border-slate-700 relative overflow-hidden flex items-center justify-center shadow-lg">
          {currentHero.avatarUrl ? (
            <img
              src={sanitizeUrl(currentHero.avatarUrl, "/images/heroes/placeholder.webp")}
              alt={`Retrato oficial de ${currentHero.name} em Last Asylum: Plague`}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <span className="text-5xl text-slate-700 font-bold">{currentHero.name[0]}</span>
          )}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-md text-xs font-black border ${getRarityBadgeColor(currentHero.rarity)}`}>
              {currentHero.rarity}
            </span>
          </div>
          {currentHero.tier && (
            <div className="absolute bottom-3 right-3 bg-slate-950/90 text-[#00ff88] border border-[#00ff88]/40 px-2.5 py-0.5 rounded text-xs font-black">
              Tier {currentHero.tier}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getFactionBadgeColor(currentHero.faction)}`}>
              {factionLabel} ({currentHero.faction})
            </span>
            <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeColor(currentHero.role)}`}>
              {roleLabel}
            </span>
            <span className="bg-slate-800/80 text-slate-300 border border-slate-700 px-3 py-1 rounded-md text-xs font-medium">
              {damageTypeLabel}
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {currentHero.name}
            </h1>
            <p className="text-base sm:text-lg text-emerald-400 font-medium mt-1">
              {currentHero.title}
            </p>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {currentHero.bio}
          </p>

          {currentHero.quote && (
            <blockquote className="italic text-slate-400 text-xs sm:text-sm border-l-2 border-emerald-500/50 pl-3 py-1">
              &ldquo;{currentHero.quote}&rdquo;
            </blockquote>
          )}

          <div className="pt-2">
            <SocialShareBar 
              url={`https://lastasylumbr.com.br/herois/${currentHero.slug}`} 
              title={`Guia Completo do Herói ${currentHero.name} - Last Asylum BR`} 
              description={currentHero.title} 
              variant="pill" 
            />
          </div>
        </div>
      </div>

      {/* 1. SEÇÃO DE DESBLOQUEIO E OBTENÇÃO */}
      <section className="bg-[#101623]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-3">
          <span className="w-2.5 h-6 bg-[#00ff88] rounded-full inline-block"></span>
          Desbloqueio e Obtenção no Servidor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#080c14] p-5 rounded-xl border border-slate-800/70 space-y-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Disponibilidade no Servidor
            </span>
            <p className="text-xl font-bold text-white">
              {isDay1 ? (
                <span className="text-[#00ff88]">Disponível no Dia 1 (Inauguração)</span>
              ) : (
                <span className="text-amber-400">Desbloqueia no Dia {currentHero.unlockInfo.serverDay} do Servidor</span>
              )}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentHero.unlockInfo.notes}
            </p>
          </div>

          <div className="bg-[#080c14] p-5 rounded-xl border border-slate-800/70 space-y-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Métodos de Recrutamento
            </span>
            <div className="flex flex-wrap gap-2">
              {currentHero.unlockInfo.methods.map((method, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-slate-200"
                >
                  {method}
                </span>
              ))}
              {currentHero.unlockInfo.laterMethods?.map((later, idx) => (
                <span
                  key={`later-${idx}`}
                  className="text-xs bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded text-slate-400"
                >
                  {later} (Posterior)
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO DE PERFIL DE COMBATE E ESTRATÉGIA */}
      <section className="bg-[#101623]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-3">
          <span className="w-2.5 h-6 bg-[#00e5ff] rounded-full inline-block"></span>
          Perfil de Combate e Análise Tática
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#080c14] p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Posicionamento</span>
            <span className="text-sm sm:text-base font-bold text-white">{getPositionLabel(currentHero.combatProfile.position)}</span>
          </div>
          <div className="bg-[#080c14] p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Função Tática</span>
            <span className="text-sm sm:text-base font-bold text-white">{roleLabel}</span>
          </div>
          <div className="bg-[#080c14] p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Tipo de Dano</span>
            <span className="text-sm sm:text-base font-bold text-white">{damageTypeLabel}</span>
          </div>
          <div className="bg-[#080c14] p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Facção de Tropa</span>
            <span className="text-sm sm:text-base font-bold text-white">{factionLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-emerald-950/20 border border-emerald-900/40 p-5 rounded-xl space-y-3">
            <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              ✓ Pontos Fortes (Prós)
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
              {currentHero.combatProfile.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-xl space-y-3">
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              ✗ Pontos Fracos (Contras)
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
              {currentHero.combatProfile.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#080c14] p-5 rounded-xl border border-slate-800 space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              Tags Táticas de Combate
            </span>
            <div className="flex flex-wrap gap-2">
              {currentHero.combatProfile.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wider bg-slate-900 text-[#00ff88] border border-[#00ff88]/30 px-2.5 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Melhor Formação Recomendada
            </span>
            <p className="text-sm text-slate-200">{currentHero.combatProfile.bestFormation}</p>
            {currentHero.combatProfile.recommendedPositioningNote && (
              <p className="text-xs text-slate-400 mt-1 italic">
                Dica tática: {currentHero.combatProfile.recommendedPositioningNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO DE HABILIDADES E EVOLUÇÃO POR ESTRELAS */}
      <section className="bg-[#101623]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-3">
            <span className="w-2.5 h-6 bg-amber-400 rounded-full inline-block"></span>
            Habilidades e Progressão de Estrelas
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Selecione o nível de estrelas para simular o efeito exato de cada habilidade de {currentHero.name} em combate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#080c14] p-4 rounded-xl border border-slate-800">
          <span className="text-xs sm:text-sm text-slate-300 font-semibold mr-1">
            Simular Estrela:
          </span>
          {availableStarLevels.map((star) => {
            const isRedStar = star > 5;
            const label = formatStarLabel(star);
            const activeStyle = isRedStar
              ? "bg-red-500/20 text-red-300 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]";

            return (
              <button
                key={star}
                onClick={() => setSelectedStar(star)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeStar === star
                    ? activeStyle
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {currentHero.skills.map((skill, idx) => {
            const starDescription = getSkillEffectForStar(skill, activeStar);

            return (
              <div
                key={idx}
                className="bg-[#080c14] border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center flex-shrink-0 text-amber-400 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{skill.name}</h3>
                      <span className="text-xs text-slate-400">Tipo: {skill.type}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {skill.cooldown && (
                      <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
                        Recarga: {skill.cooldown}
                      </span>
                    )}
                    {skill.damageType && skill.damageType !== "None" && (
                      <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-amber-300">
                        Dano: {getDamageTypeLabel(skill.damageType)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">
                    Descrição Base
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{skill.description}</p>
                </div>

                {activeStar !== 1 && (
                  <div className="bg-[#101623] p-4 rounded-xl border border-amber-500/30 space-y-1">
                    <span className="text-xs text-amber-400 font-semibold block">
                      Aprimoramento no Nível {formatStarLabel(activeStar)}:
                    </span>
                    <p className="text-sm text-[#00ff88] font-medium leading-relaxed">
                      {starDescription}
                    </p>
                  </div>
                )}

                {skill.progression && skill.progression.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <details className="group">
                      <summary className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-medium select-none flex items-center justify-between">
                        <span>Ver todas as etapas de evolução de estrelas desta habilidade</span>
                        <span className="text-emerald-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-3 space-y-2">
                        {Array.from(skill.progression)
                          .sort((a, b) => a.starsRequired - b.starsRequired)
                          .map((step, stepIdx) => {
                            const isRed = step.starsRequired > 5;
                            return (
                              <div
                                key={stepIdx}
                                className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`font-bold ${isRed ? 'text-red-400' : 'text-amber-400'}`}>
                                    {formatStarLabel(step.starsRequired)}
                                  </span>
                                  {step.title && <span className="text-slate-300 font-medium">{step.title}</span>}
                                </div>
                                <p className="text-slate-400">{step.description}</p>
                              </div>
                            );
                        })}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SEÇÃO DE CALCULADORAS DE RECURSOS */}
      <section className="bg-gradient-to-br from-slate-900 via-[#101623] to-[#080c14] border border-[#00ff88]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-6 shadow-xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#00ff88]/10 blur-3xl rounded-full pointer-events-none"></div>

        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-2.5 h-6 bg-[#00ff88] rounded-full inline-block"></span>
            Calculadoras de Recursos para {currentHero.name}
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Planeje com exatidão a quantidade de Fragmentos, Antitoxina e Insígnias de Habilidade necessárias para evoluir {currentHero.name} até o nível máximo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            href={sanitizeUrl(currentHero.calculatorLinks?.shardsUrl, `/calculadoras?tab=shards&hero=${sanitizeSlug(currentHero.slug)}`)}
            className="bg-[#00ff88] hover:bg-[#00e5ff] text-slate-950 font-bold p-5 rounded-2xl transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] flex flex-col justify-between"
          >
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900 block mb-1">
                Evolução de Estrelas
              </span>
              <span className="text-lg font-black block">Calculadora de Fragmentos</span>
            </div>
            <span className="text-xs font-semibold mt-4 text-slate-900 flex items-center gap-1">
              Calcular Shards de {currentHero.name} →
            </span>
          </Link>

          <Link
            href={sanitizeUrl(currentHero.calculatorLinks?.antitoxinUrl, `/calculadoras?tab=antitoxin&hero=${sanitizeSlug(currentHero.slug)}`)}
            className="bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-[#00ff88] font-bold p-5 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                Nível de Herói (1–150)
              </span>
              <span className="text-lg font-bold block">Calculadora de Antitoxina</span>
            </div>
            <span className="text-xs text-[#00ff88] mt-4 flex items-center gap-1">
              Calcular Custo de Antitoxina →
            </span>
          </Link>

          <Link
            href={sanitizeUrl(currentHero.calculatorLinks?.badgesUrl, `/calculadoras?tab=badges&hero=${sanitizeSlug(currentHero.slug)}`)}
            className="bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-[#00ff88] font-bold p-5 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                Nível de Habilidades
              </span>
              <span className="text-lg font-bold block">Calculadora de Insígnias</span>
            </div>
            <span className="text-xs text-[#00ff88] mt-4 flex items-center gap-1">
              Calcular Skill Badges →
            </span>
          </Link>
        </div>
      </section>

      {/* 5. SEÇÃO DE HERÓIS COM ALTA SINERGIA E RELACIONADOS */}
      {relatedHeroes.length > 0 && (
        <section className="bg-[#101623]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-3">
            <span className="w-2.5 h-6 bg-purple-500 rounded-full inline-block"></span>
            Heróis com Alta Sinergia e Relacionados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedHeroes.map((related) => (
              <div
                key={related.id}
                className="bg-[#080c14] border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex-shrink-0">
                    <img
                      src={sanitizeUrl(related.avatarUrl, "/images/heroes/placeholder.webp")}
                      alt={`Retrato oficial de ${related.name} em Last Asylum: Plague`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{related.name}</h3>
                    <span className="text-xs text-slate-400">{getFactionLabel(related.faction)} • {related.rarity}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{related.title}</p>

                <Link
                  href={`/herois/${sanitizeSlug(related.slug)}`}
                  className="block w-full text-center bg-slate-900 hover:bg-[#00ff88] hover:text-slate-950 text-white text-xs font-semibold py-2.5 rounded-lg border border-slate-700 hover:border-[#00ff88] transition-all"
                >
                  Ver Guia de {related.name}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
