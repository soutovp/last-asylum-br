"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  getAllHeroes,
  fetchHeroesAsync,
  getServerSettings,
  Hero,
  getFactionLabel,
  getRoleLabel,
  getRarityBadgeColor,
  getFactionBadgeColor,
  getRoleBadgeColor,
} from "@/lib/heroes";

export default function HeroesLanding() {
  const [heroesList, setHeroesList] = useState<Hero[]>(() => getAllHeroes());
  const [searchTerm, setSearchTerm] = useState("");
  const [serverAge, setServerAge] = useState<number>(() => getServerSettings().currentServerDay || 36);
  const [factionFilter, setFactionFilter] = useState("Todos");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [rarityFilter, setRarityFilter] = useState("Todos");

  useEffect(() => {
    fetchHeroesAsync().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setHeroesList(fetched);
      }
    });

    const handleUpdate = () => {
      setHeroesList(getAllHeroes());
      const settings = getServerSettings();
      if (settings?.currentServerDay) {
        setServerAge(settings.currentServerDay);
      }
    };

    window.addEventListener("heroes_updated", handleUpdate);
    window.addEventListener("heroes_server_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("heroes_updated", handleUpdate);
      window.removeEventListener("heroes_server_settings_updated", handleUpdate);
    };
  }, []);

  const filteredHeroes = useMemo(() => {
    return heroesList.filter((h) => {
      const matchSearch =
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.combatProfile.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchFaction = factionFilter === "Todos" || h.faction === factionFilter;
      const matchRole = roleFilter === "Todos" || h.role === roleFilter;
      const matchRarity = rarityFilter === "Todos" || h.rarity === rarityFilter;
      return matchSearch && matchFaction && matchRole && matchRarity;
    });
  }, [heroesList, searchTerm, factionFilter, roleFilter, rarityFilter]);

  const availableHeroes = filteredHeroes.filter((h) => h.unlockInfo.serverDay <= serverAge);
  const upcomingHeroes = filteredHeroes.filter((h) => h.unlockInfo.serverDay > serverAge);
  const nextUnlock = upcomingHeroes.sort((a, b) => a.unlockInfo.serverDay - b.unlockInfo.serverDay)[0];

  return (
    <div className="w-full space-y-12">
      {/* SEÇÃO PRINCIPAL / HERO HEADER */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-2">
          <span>🛡️ Base de Dados & Planejamento</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-md tracking-tight">
          Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00e5ff] toxic-text-glow">Heróis</span>
        </h1>
        <p className="text-slate-300 font-medium text-base sm:text-lg">
          Guia completo de atributos, habilidades, evolução de estrelas e cronograma de desbloqueio por idade do servidor no Last Asylum: Plague.
        </p>

        {/* CAMPO DE BUSCA */}
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Buscar por herói, título ou tag (Burn, Shield, AoE)..."
            className="w-full bg-[#101623]/90 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-[#00ff88] transition-colors placeholder:text-slate-500 text-sm shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CONTROLE DE IDADE DO SERVIDOR */}
      <div className="bg-[#101623]/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Idade do seu Servidor (Dias de Abertura)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={serverAge}
              onChange={(e) => setServerAge(Number(e.target.value))}
              className="accent-[#00ff88] w-48 sm:w-64 cursor-pointer"
            />
            <span className="text-2xl font-bold text-[#00ff88]">{serverAge} dias</span>
          </div>
        </div>

        <div className="flex flex-col text-right w-full sm:w-auto bg-[#080c14] p-4 rounded-xl border border-slate-800/70">
          <div className="text-slate-200 text-sm font-medium">
            <span className="text-[#00ff88] font-extrabold text-base">{availableHeroes.length}</span> Heróis Disponíveis no seu Servidor
          </div>
          {nextUnlock ? (
            <div className="text-xs text-slate-400 mt-1">
              Próximo herói: <span className="text-amber-400 font-bold">{nextUnlock.name}</span> em {nextUnlock.unlockInfo.serverDay - serverAge} dias (Dia {nextUnlock.unlockInfo.serverDay})
            </div>
          ) : (
            <div className="text-xs text-[#00ff88] mt-1 font-semibold">Todos os heróis desbloqueados neste dia de servidor!</div>
          )}
        </div>
      </div>

      {/* FILTROS POR FACÇÃO, FUNÇÃO E RARIDADE */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "Todos", label: "Todas as Facções" },
            { id: "Warrior", label: "Guerreiro (Warrior)" },
            { id: "Ranger", label: "Atirador (Ranger)" },
            { id: "Warlock", label: "Feiticeiro (Warlock)" },
          ].map((fac) => (
            <button
              key={fac.id}
              onClick={() => setFactionFilter(fac.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                factionFilter === fac.id
                  ? "bg-slate-700 text-white shadow-md border border-slate-500"
                  : "bg-[#101623]/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {fac.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "Todos", label: "Todas as Funções" },
            { id: "Tank", label: "Tanque (Tank)" },
            { id: "Carry", label: "Carry (Dano)" },
            { id: "Support", label: "Suporte (Support)" },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setRoleFilter(role.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === role.id
                  ? "bg-slate-700 text-white shadow-md border border-slate-500"
                  : "bg-[#101623]/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {role.label}
            </button>
          ))}

          {["Todos", "UR", "SSR"].map((rarity) => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarity)}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                rarityFilter === rarity
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "bg-[#101623]/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* GRADE DE HERÓIS */}
      {filteredHeroes.length === 0 ? (
        <div className="text-center py-20 bg-[#101623]/50 rounded-2xl border border-slate-800/50 space-y-3">
          <p className="text-slate-300 text-lg font-semibold">Nenhum herói encontrado com os filtros selecionados.</p>
          <p className="text-slate-500 text-sm">Tente redefinir a busca ou ajustar os filtros de facção e função.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {availableHeroes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                <span className="w-2.5 h-6 bg-[#00ff88] rounded-full inline-block"></span>
                Heróis Disponíveis no Servidor ({availableHeroes.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableHeroes.map((h) => (
                  <HeroCard key={h.id} hero={h} isAvailable={true} />
                ))}
              </div>
            </section>
          )}

          {upcomingHeroes.length > 0 && (
            <section className="opacity-90">
              <h2 className="text-2xl font-bold text-slate-400 mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                <span className="w-2.5 h-6 bg-amber-400 rounded-full inline-block"></span>
                Em Breve no Servidor ({upcomingHeroes.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingHeroes.map((h) => (
                  <HeroCard key={h.id} hero={h} isAvailable={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* GUIA DO SISTEMA DE HERÓIS (SEO & CONTEÚDO EDUCACIONAL) */}
      <section className="bg-[#101623]/80 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 mt-16">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b border-slate-800 pb-3">
            Guia do Sistema de Heróis no Last Asylum: Plague
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Entenda a mecânica de facções, funções de combate e progressão de estrelas para otimizar suas formações de PvP e PvE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#080c14] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-[#00ff88] flex items-center gap-2">
              <span>⚔️</span> <span>Facções de Tropa</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Os heróis pertencem a três facções fundamentais: <strong>Guerreiro (Warrior)</strong>, <strong>Atirador (Ranger)</strong> e <strong>Feiticeiro (Warlock)</strong>. Compor equipes com 3 ou 5 heróis da mesma facção concede bônus massivos de Ataque, Defesa e HP.
            </p>
          </div>

          <div className="bg-[#080c14] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-[#00e5ff] flex items-center gap-2">
              <span>🛡️</span> <span>Funções Táticas</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Distribua sua formação entre <strong>Tanques (Vanguarda)</strong> para absorção de impacto, <strong>Carries (Retaguarda)</strong> para dano explosivo ou contínuo, e <strong>Suportes</strong> para controle, cura e redução de armadura inimiga.
            </p>
          </div>

          <div className="bg-[#080c14] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <span>⭐</span> <span>Evolução de Estrelas</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A evolução abrange 1 a 5 estrelas amarelas (iniciais) e avança para 1 a 5 estrelas vermelhas (10★ total). Cada marco desbloqueia novos efeitos transcendentais nas habilidades do personagem.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroCard({ hero, isAvailable }: { hero: Hero; isAvailable: boolean }) {
  const isDay1 = hero.unlockInfo.serverDay === 1;

  return (
    <div
      className={`relative bg-[#101623]/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all shadow-lg flex flex-col justify-between ${
        !isAvailable ? "grayscale-[35%] opacity-90" : ""
      }`}
    >
      <div className="h-60 bg-slate-900 relative overflow-hidden flex items-center justify-center">
        {hero.avatarUrl ? (
          <img
            src={hero.avatarUrl}
            alt={`Retrato de ${hero.name}`}
            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-700 font-bold text-3xl">{hero.name}</div>
        )}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-black shadow-md backdrop-blur-sm border ${getRarityBadgeColor(hero.rarity)}`}>
          {hero.rarity}
        </div>
        {!isAvailable ? (
          <div className="absolute top-3 right-3 bg-red-900/90 text-red-100 border border-red-500/30 px-2 py-1 rounded text-xs font-bold shadow-md backdrop-blur-sm">
            Dia {hero.unlockInfo.serverDay}
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-bold shadow-md backdrop-blur-sm">
            {isDay1 ? "Dia 1" : `Dia ${hero.unlockInfo.serverDay}`}
          </div>
        )}
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-white">{hero.name}</h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getFactionBadgeColor(hero.faction)}`}>
              {getFactionLabel(hero.faction)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{hero.title}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-b border-slate-800/80 py-2">
          <span>Função: <strong className="text-slate-200">{getRoleLabel(hero.role)}</strong></span>
          <span>Dano: <strong className="text-slate-200">{hero.damageType}</strong></span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {hero.combatProfile.tags.slice(0, 4).map((t: string) => (
            <span
              key={t}
              className="text-[10px] uppercase tracking-wider bg-slate-800/80 text-[#00ff88] px-2 py-0.5 rounded border border-slate-700/50"
            >
              {t}
            </span>
          ))}
        </div>

        <Link
          href={`/herois/${hero.slug}`}
          className="block w-full text-center bg-slate-800 hover:bg-[#00ff88] hover:text-slate-950 text-white py-2.5 rounded-lg text-sm font-semibold transition-all border border-slate-700 hover:border-[#00ff88]"
        >
          Ver Perfil Completo →
        </Link>
      </div>
    </div>
  );
}
