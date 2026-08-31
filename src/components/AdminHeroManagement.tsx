"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Hero,
  HeroRarity,
  HeroFaction,
  HeroRole,
  HeroDamageType,
  HeroPosition,
  SkillType,
  getAllHeroes,
  fetchHeroesAsync,
  saveHero,
  deleteHero,
  resetHeroesToDefault,
  getServerSettings,
  saveServerSettings,
  categorizeHeroesByServerAge,
  createDefaultHeroTemplate,
  getFactionLabel,
  getRoleLabel,
  getDamageTypeLabel,
  getRarityBadgeColor,
  getFactionBadgeColor,
  getRoleBadgeColor,
  sanitizeSlug,
  sanitizeText,
  getAvailableStarOptions,
  formatStarLabel,
} from "@/lib/heroes";
import { compressImageToWebp } from "@/lib/imageCompression";
import { UserSession } from "@/lib/auth";
import { canUserAccessPage } from "@/lib/permissions";

interface AdminHeroManagementProps {
  session?: UserSession;
}

export default function AdminHeroManagement({ session }: AdminHeroManagementProps) {
  const [heroes, setHeroes] = useState<Hero[]>(() => getAllHeroes());
  const [serverSettings, setServerSettingsState] = useState(() => getServerSettings());
  const [serverDayInput, setServerDayInput] = useState<number>(() => getServerSettings().currentServerDay || 36);
  const [activeTab, setActiveTab] = useState<"todos" | "atuais" | "proximos">("todos");
  const [search, setSearch] = useState("");
  const [selectedFaction, setSelectedFaction] = useState("Todos");
  const [selectedRarity, setSelectedRarity] = useState("Todos");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"identidade" | "combate" | "desbloqueio" | "habilidades" | "sinergias" | "calculadoras">("identidade");
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [isNewHero, setIsNewHero] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estados Locais para Edição Livre de Campos Multilinha / Listas (Permite Espaços e Quebras de Linha)
  const [rawTagsInput, setRawTagsInput] = useState("");
  const [rawProsInput, setRawProsInput] = useState("");
  const [rawConsInput, setRawConsInput] = useState("");
  const [rawMethodsInput, setRawMethodsInput] = useState("");
  const [rawSourceUrlsInput, setRawSourceUrlsInput] = useState("");

  // Verificação de Autorização RBAC estrita (Fail-closed)
  const canManageHeroes = Boolean(session && canUserAccessPage(session.role, "herois"));
  const isSuperOrAdmin = Boolean(session && (session.role === "ADM" || session.role === "SUPER"));

  // Carrega lista assíncrona do Supabase se disponível
  useEffect(() => {
    fetchHeroesAsync().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setHeroes(fetched);
      }
    });

    const handleSync = () => {
      setHeroes(getAllHeroes());
      const s = getServerSettings();
      setServerSettingsState(s);
      setServerDayInput(s.currentServerDay || 36);
    };

    window.addEventListener("heroes_updated", handleSync);
    window.addEventListener("heroes_server_settings_updated", handleSync);
    return () => {
      window.removeEventListener("heroes_updated", handleSync);
      window.removeEventListener("heroes_server_settings_updated", handleSync);
    };
  }, []);

  // Categorização de Atuais e Próximos
  const categorization = useMemo(() => {
    return categorizeHeroesByServerAge(heroes, serverDayInput);
  }, [heroes, serverDayInput]);

  // Lista Filtrada para a Tabela
  const filteredHeroes = useMemo(() => {
    let list = heroes;
    if (activeTab === "atuais") {
      list = categorization.available;
    } else if (activeTab === "proximos") {
      list = categorization.upcoming;
    }

    const term = search.trim().toLowerCase();
    return list.filter((h) => {
      const matchSearch =
        !term ||
        h.name.toLowerCase().includes(term) ||
        h.slug.toLowerCase().includes(term) ||
        h.title.toLowerCase().includes(term) ||
        h.combatProfile.tags.some((t) => t.toLowerCase().includes(term));
      const matchFaction = selectedFaction === "Todos" || h.faction === selectedFaction;
      const matchRarity = selectedRarity === "Todos" || h.rarity === selectedRarity;
      return matchSearch && matchFaction && matchRarity;
    });
  }, [heroes, activeTab, categorization, search, selectedFaction, selectedRarity]);

  // Salvar idade do servidor
  const handleSaveServerDay = async () => {
    if (!canManageHeroes) {
      setFeedbackMsg({ type: "error", text: "Você não possui privilégios para alterar as configurações do servidor." });
      return;
    }
    if (serverDayInput < 1 || serverDayInput > 3650) {
      setFeedbackMsg({ type: "error", text: "O dia de servidor deve estar entre 1 e 3650." });
      return;
    }
    const res = await saveServerSettings({
      currentServerDay: serverDayInput,
      defaultServerAge: serverDayInput,
    });
    if (res.success) {
      setFeedbackMsg({ type: "success", text: `Idade padrão do servidor definida para o Dia ${serverDayInput}!` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Erro ao salvar configurações do servidor." });
    }
  };

  // Abrir Modal para Novo Herói
  const handleOpenCreate = () => {
    if (!canManageHeroes) {
      setFeedbackMsg({ type: "error", text: "Permissão negada para cadastrar novos heróis." });
      return;
    }
    const template = createDefaultHeroTemplate({
      id: `heroi-${Date.now().toString(36)}`,
      slug: `novo-heroi-${heroes.length + 1}`,
      name: `Novo Herói ${heroes.length + 1}`,
      unlockInfo: {
        serverDay: serverDayInput,
        methods: ["Recrutamento da Taberna", "Eventos da Semana"],
        notes: `Disponível a partir do Dia ${serverDayInput} de abertura.`,
        isAvailableDay1: serverDayInput === 1,
      },
    });
    setEditingHero(template);
    setRawTagsInput(template.combatProfile.tags.join(", "));
    setRawProsInput(template.combatProfile.pros.join("\n"));
    setRawConsInput(template.combatProfile.cons.join("\n"));
    setRawMethodsInput(template.unlockInfo.methods.join(", "));
    setRawSourceUrlsInput(template.sourceUrls.join("\n"));
    setIsNewHero(true);
    setModalTab("identidade");
    setIsModalOpen(true);
  };

  // Abrir Modal para Edição de Herói
  const handleOpenEdit = (hero: Hero) => {
    if (!canManageHeroes) {
      setFeedbackMsg({ type: "error", text: "Permissão negada para editar heróis." });
      return;
    }
    // Clona o objeto profundamente para não mutar estado até salvar
    const cloned = JSON.parse(JSON.stringify(hero));
    setEditingHero(cloned);
    setRawTagsInput(cloned.combatProfile.tags.join(", "));
    setRawProsInput(cloned.combatProfile.pros.join("\n"));
    setRawConsInput(cloned.combatProfile.cons.join("\n"));
    setRawMethodsInput(cloned.unlockInfo.methods.join(", "));
    setRawSourceUrlsInput(cloned.sourceUrls.join("\n"));
    setIsNewHero(false);
    setModalTab("identidade");
    setIsModalOpen(true);
  };

  // Excluir Herói
  const handleDeleteHero = async (hero: Hero) => {
    if (!canManageHeroes) {
      setFeedbackMsg({ type: "error", text: "Permissão negada para excluir heróis." });
      return;
    }
    if (!window.confirm(`Tem certeza absoluta que deseja remover o herói "${hero.name}" (${hero.rarity}) permanentemente do catálogo e servidor?`)) {
      return;
    }
    const res = await deleteHero(hero.id);
    if (res.success) {
      if (isModalOpen) {
        setIsModalOpen(false);
        setEditingHero(null);
      }
      setFeedbackMsg({ type: "success", text: `Herói "${hero.name}" removido com sucesso!` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Erro ao remover herói." });
    }
  };

  // Restaurar Padrões Oficiais
  const handleResetDefaults = async () => {
    if (!isSuperOrAdmin) {
      setFeedbackMsg({
        type: "error",
        text: "Ação restrita: Apenas Administradores ou Supervisores podem restaurar o catálogo de fábrica.",
      });
      return;
    }
    if (
      !window.confirm(
        "Atenção Crítica: Esta ação restaurará todos os 15 heróis oficiais padrão da base original, substituindo quaisquer cadastros ou alterações locais. Deseja prosseguir?"
      )
    ) {
      return;
    }
    const res = await resetHeroesToDefault();
    if (res.success) {
      setFeedbackMsg({ type: "success", text: "15 heróis oficiais restaurados com sucesso!" });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Erro ao restaurar catálogo padrão." });
    }
  };

  // Upload e Compressão Segura de Imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "avatarUrl" | "fullImageUrl" | "bannerUrl") => {
    const file = e.target.files?.[0];
    if (!file || !editingHero) return;

    // 1. Validação estrita de tipo MIME (apenas imagens reais)
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedMimes.includes(file.type.toLowerCase())) {
      setFeedbackMsg({
        type: "error",
        text: "Formato de arquivo não suportado. Envie apenas imagens nos formatos JPEG, PNG, WebP, GIF ou AVIF.",
      });
      e.target.value = "";
      return;
    }

    // 2. Validação estrita de tamanho máximo de arquivo (5MB)
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFeedbackMsg({
        type: "error",
        text: "A imagem selecionada excede o limite máximo permitido de 5MB.",
      });
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      const compressed = await compressImageToWebp(file, 800, 800, 0.85);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setEditingHero((prev) => (prev ? { ...prev, [field]: base64 } : null));
        setUploadingImage(false);
        setFeedbackMsg({ type: "success", text: "Imagem processada e otimizada em WebP com sucesso!" });
        setTimeout(() => setFeedbackMsg(null), 3000);
      };
      reader.onerror = () => {
        setUploadingImage(false);
        setFeedbackMsg({ type: "error", text: "Erro ao ler arquivo de imagem." });
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Erro na compressão de imagem:", err);
      setUploadingImage(false);
      setFeedbackMsg({ type: "error", text: "Falha no processamento seguro da imagem." });
    } finally {
      e.target.value = "";
    }
  };

  // Salvar Herói (Create/Update)
  const handleSaveHero = async () => {
    if (!editingHero) return;
    if (!canManageHeroes) {
      setFeedbackMsg({ type: "error", text: "Permissão negada para salvar alterações de heróis." });
      return;
    }

    const heroToSave: Hero = {
      ...editingHero,
      combatProfile: {
        ...editingHero.combatProfile,
        tags: rawTagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        pros: rawProsInput
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
        cons: rawConsInput
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean),
      },
      unlockInfo: {
        ...editingHero.unlockInfo,
        methods: rawMethodsInput
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
      },
      sourceUrls: rawSourceUrlsInput
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean),
    };

    setSavingHero(true);
    const res = await saveHero(heroToSave);
    setSavingHero(false);

    if (res.success) {
      setIsModalOpen(false);
      setEditingHero(null);
      setFeedbackMsg({
        type: "success",
        text: `Herói "${res.hero.name}" gravado com sucesso no catálogo e servidor!`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({
        type: "error",
        text: res.error || "Falha na validação dos campos obrigatórios.",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-xl transition-all ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
              : "bg-red-950/90 text-red-300 border-red-500/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedbackMsg.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Header com Métricas de Rotação Temporal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#101623]/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total de Heróis</span>
            <span className="text-xl">🛡️</span>
          </div>
          <div className="text-3xl font-black text-white mt-2">{categorization.totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cadastrados no catálogo</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#101623]/90 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Heróis Atuais</span>
            <span className="text-xl">🟢</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{categorization.availableCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Desbloqueados até o dia {serverDayInput}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#101623]/90 border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-xl rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Próximos / Em Breve</span>
            <span className="text-xl">⏳</span>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">{categorization.upcomingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {categorization.nextUnlock ? (
              <span>
                Próximo: <strong className="text-amber-300">{categorization.nextUnlock.hero.name}</strong> em {categorization.nextUnlock.daysLeft}d
              </span>
            ) : (
              "Todos liberados no servidor"
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#101623]/90 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Idade do Servidor</span>
            <span className="text-xl">📅</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              min="1"
              max="200"
              value={serverDayInput}
              onChange={(e) => setServerDayInput(Number(e.target.value) || 1)}
              className="w-20 bg-slate-900 border border-cyan-500/50 rounded-xl px-3 py-1.5 text-white text-lg font-black focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xs text-slate-400 font-bold">dias</span>
            <button
              onClick={handleSaveServerDay}
              className="ml-auto px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black hover:bg-cyan-400 transition-colors shadow-md"
              title="Salvar dia de referência do servidor"
            >
              Definir
            </button>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Regra padrão de rotação</div>
        </div>
      </div>

      {/* Toolbar Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#101623]/90 border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Abas de Navegação */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("todos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "todos"
                ? "bg-slate-700 text-white shadow-md border border-slate-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Todos ({categorization.totalCount})
          </button>
          <button
            onClick={() => setActiveTab("atuais")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "atuais"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🟢 Atuais / Disponíveis ({categorization.availableCount})
          </button>
          <button
            onClick={() => setActiveTab("proximos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "proximos"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⏳ Próximos / Em Breve ({categorization.upcomingCount})
          </button>
        </div>

        {/* Filtros Rápidos e Ações */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nome, slug, função ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ff88] min-w-[220px]"
          />

          <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#00ff88]"
          >
            <option value="Todos">Todas as Facções</option>
            <option value="Warrior">Guerreiro</option>
            <option value="Ranger">Atirador</option>
            <option value="Warlock">Feiticeiro</option>
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#00ff88]"
          >
            <option value="Todos">Todas Raridades</option>
            <option value="UR">UR</option>
            <option value="SSR">SSR</option>
          </select>

          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
            title="Restaura os 15 heróis oficiais de fábrica"
          >
            Restaurar Oficiais
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] transition-all cursor-pointer"
          >
            + Novo Herói
          </button>
        </div>
      </div>

      {/* Tabela de Heróis */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#101623]/80 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-400 border-b border-slate-800 tracking-wider">
            <tr>
              <th className="px-6 py-4">Herói & Slug</th>
              <th className="px-6 py-4">Raridade</th>
              <th className="px-6 py-4">Facção / Função</th>
              <th className="px-6 py-4">Dano / Posição</th>
              <th className="px-6 py-4">Desbloqueio</th>
              <th className="px-6 py-4">Status no Servidor</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHeroes.map((h) => {
              const isAvailable = h.unlockInfo.serverDay <= serverDayInput;
              const daysLeft = Math.max(0, h.unlockInfo.serverDay - serverDayInput);

              return (
                <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {h.avatarUrl ? (
                          <img src={h.avatarUrl} alt={h.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base font-bold text-slate-500">{h.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-white flex items-center gap-2">
                          <span>{h.name}</span>
                          {h.tier && (
                            <span className="text-[10px] bg-slate-900 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded font-black">
                              T-{h.tier}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{h.title}</div>
                        <span className="text-[10px] text-slate-500 font-mono">/herois/{h.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${getRarityBadgeColor(h.rarity)}`}>
                      {h.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border w-max ${getFactionBadgeColor(h.faction)}`}>
                        {getFactionLabel(h.faction)}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border w-max ${getRoleBadgeColor(h.role)}`}>
                        {getRoleLabel(h.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300 font-medium">{getDamageTypeLabel(h.damageType)}</div>
                    <div className="text-[10px] text-slate-500">{h.combatProfile.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-200">
                      {h.unlockInfo.serverDay === 1 ? "Dia 1 (Início)" : `Dia ${h.unlockInfo.serverDay}`}
                    </div>
                    <div className="text-[10px] text-slate-400 max-w-[140px] truncate" title={h.unlockInfo.methods.join(", ")}>
                      {h.unlockInfo.methods[0] || "Taberna"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAvailable ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Disponível
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 w-max">
                        <span>⏳</span>
                        Em {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/herois/${h.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                        title="Ver página pública do herói"
                      >
                        🔗
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(h)}
                        className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors border border-cyan-500/20 font-bold text-xs"
                        title="Editar configurações e habilidades"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteHero(h)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 font-bold text-xs"
                        title="Excluir herói"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredHeroes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-500 text-sm">
                  Nenhum herói encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação / Edição de Herói */}
      {isModalOpen && editingHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080c14]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-[#101623] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isNewHero ? "Cadastrar Novo Herói" : `Editar Herói: ${editingHero.name}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajuste dados de catálogo, dia de liberação, atributos de combate e habilidades.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Abas Internas do Modal */}
            <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/30 px-6 gap-2 pt-2">
              {[
                { id: "identidade", label: "1. Identidade & Mídia" },
                { id: "combate", label: "2. Perfil de Combate" },
                { id: "desbloqueio", label: "3. Desbloqueio & Servidor" },
                { id: "habilidades", label: "4. Habilidades & Estrelas" },
                { id: "sinergias", label: "5. Sinergias & Relações" },
                { id: "calculadoras", label: "6. Links & Calculadoras" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    modalTab === tab.id
                      ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/5 rounded-t-lg"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Corpo do Formulário com Scroll */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* ABA 1: IDENTIDADE & MÍDIA */}
              {modalTab === "identidade" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Herói *</label>
                      <input
                        type="text"
                        value={editingHero.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingHero((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  name: val,
                                  slug: isNewHero ? sanitizeSlug(val) : prev.slug,
                                }
                              : null
                          );
                        }}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                        placeholder="Ex: Nicole"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Slug URL (/herois/[slug]) *</label>
                      <input
                        type="text"
                        value={editingHero.slug}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, slug: sanitizeSlug(e.target.value) } : null))
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#00ff88]"
                        placeholder="Ex: nicole"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Título / Especialidade</label>
                      <input
                        type="text"
                        value={editingHero.title}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, title: e.target.value } : null))
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                        placeholder="Ex: A Bruxa da Peste Tóxica"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Raridade *</label>
                      <select
                        value={editingHero.rarity}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, rarity: e.target.value as HeroRarity } : null))
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      >
                        <option value="UR">UR (Ultra Raro)</option>
                        <option value="SSR">SSR (Super Raro)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Facção *</label>
                      <select
                        value={editingHero.faction}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, faction: e.target.value as HeroFaction } : null))
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      >
                        <option value="Warrior">Guerreiro (Warrior)</option>
                        <option value="Ranger">Atirador (Ranger)</option>
                        <option value="Warlock">Feiticeiro (Warlock)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Função de Combate *</label>
                      <select
                        value={editingHero.role}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, role: e.target.value as HeroRole } : null))
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      >
                        <option value="Carry">Carry (Dano Principal)</option>
                        <option value="Tank">Tanque (Defesa)</option>
                        <option value="Support">Suporte (Utilidade)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Dano *</label>
                      <select
                        value={editingHero.damageType}
                        onChange={(e) =>
                          setEditingHero((prev) =>
                            prev ? { ...prev, damageType: e.target.value as HeroDamageType } : null
                          )
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      >
                        <option value="Physical">Físico (Physical)</option>
                        <option value="Energy">Energia (Energy)</option>
                        <option value="Mixed">Misto (Mixed)</option>
                      </select>
                    </div>
                  </div>

                  {/* Fotos e URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <label className="block text-xs font-bold text-slate-300">Avatar / Retrato do Herói</label>
                      <input
                        type="text"
                        value={editingHero.avatarUrl}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, avatarUrl: e.target.value } : null))
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff88]"
                        placeholder="https://.../avatar.webp"
                      />
                      <div className="flex items-center gap-3">
                        <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 cursor-pointer border border-slate-700 transition-colors">
                          📁 Upload Avatar (WebP Auto)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "avatarUrl")}
                            className="hidden"
                          />
                        </label>
                        {editingHero.avatarUrl && (
                          <img src={editingHero.avatarUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <label className="block text-xs font-bold text-slate-300">Imagem Completa (Full Body / Arte)</label>
                      <input
                        type="text"
                        value={editingHero.fullImageUrl}
                        onChange={(e) =>
                          setEditingHero((prev) => (prev ? { ...prev, fullImageUrl: e.target.value } : null))
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff88]"
                        placeholder="https://.../full-image.webp"
                      />
                      <div className="flex items-center gap-3">
                        <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 cursor-pointer border border-slate-700 transition-colors">
                          📁 Upload Arte (WebP Auto)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "fullImageUrl")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Biografia & Resumo Estratégico</label>
                    <textarea
                      rows={3}
                      value={editingHero.bio}
                      onChange={(e) =>
                        setEditingHero((prev) => (prev ? { ...prev, bio: e.target.value } : null))
                      }
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      placeholder="Descrição detalhada das funções do herói..."
                    />
                  </div>
                </div>
              )}

              {/* ABA 2: PERFIL DE COMBATE */}
              {modalTab === "combate" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Posicionamento Recomendado</label>
                      <select
                        value={editingHero.combatProfile.position}
                        onChange={(e) =>
                          setEditingHero((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  combatProfile: {
                                    ...prev.combatProfile,
                                    position: e.target.value as HeroPosition,
                                  },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      >
                        <option value="Frontline">Frontline (Vanguarda / Linha de Frente)</option>
                        <option value="Backline">Backline (Retaguarda / Linha Traseira)</option>
                        <option value="Flexible">Flexible (Posicionamento Flexível)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Tags de Combate (separadas por vírgula)</label>
                      <input
                        type="text"
                        value={rawTagsInput}
                        onChange={(e) => setRawTagsInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                        placeholder="Ex: Burn, AoE, Carry, Energy Damage, Crit"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-400 mb-1">Prós / Pontos Fortes (1 por linha)</label>
                      <textarea
                        rows={4}
                        value={rawProsInput}
                        onChange={(e) => setRawProsInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Dano em área massivo&#10;Excelente aplicação de queimadura"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-red-400 mb-1">Contras / Desvantagens (1 por linha)</label>
                      <textarea
                        rows={4}
                        value={rawConsInput}
                        onChange={(e) => setRawConsInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                        placeholder="Defesa física baixa&#10;Vulnerável a assassinos"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Melhor Formação Recomendada</label>
                    <input
                      type="text"
                      value={editingHero.combatProfile.bestFormation}
                      onChange={(e) =>
                        setEditingHero((prev) =>
                          prev
                            ? {
                                ...prev,
                                combatProfile: {
                                  ...prev.combatProfile,
                                  bestFormation: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      placeholder="Ex: Linha traseira protegida por tanques duráveis como Marlena ou Zoya."
                    />
                  </div>
                </div>
              )}

              {/* ABA 3: DESBLOQUEIO & SERVIDOR */}
              {modalTab === "desbloqueio" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300">
                    💡 O campo <strong>Dia de Desbloqueio</strong> define automaticamente se este herói é classificado como <strong>Atual</strong> ou <strong>Próximo</strong> para os jogadores conforme a idade de abertura do servidor!
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Dia de Desbloqueio no Servidor (serverDay) *</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={editingHero.unlockInfo.serverDay}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          setEditingHero((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  unlockInfo: {
                                    ...prev.unlockInfo,
                                    serverDay: val,
                                    isAvailableDay1: val === 1,
                                  },
                                }
                              : null
                          );
                        }}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Métodos de Obtenção Iniciais (separados por vírgula)</label>
                      <input
                        type="text"
                        value={rawMethodsInput}
                        onChange={(e) => setRawMethodsInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                        placeholder="Ex: 1st Top Up, Pacotes da Loja, Taberna"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Notas de Desbloqueio e Rotação</label>
                    <textarea
                      rows={3}
                      value={editingHero.unlockInfo.notes}
                      onChange={(e) =>
                        setEditingHero((prev) =>
                          prev
                            ? {
                                ...prev,
                                unlockInfo: {
                                  ...prev.unlockInfo,
                                  notes: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00ff88]"
                      placeholder="Ex: Disponível desde o Dia 1 no bônus de 1ª Recarga..."
                    />
                  </div>
                </div>
              )}

              {/* ABA 4: HABILIDADES */}
              {modalTab === "habilidades" && (
                <div className="space-y-6">
                  {editingHero.skills.map((skill, sIdx) => (
                    <div key={skill.id || sIdx} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 relative">
                      <button
                        onClick={() => {
                          setEditingHero(prev => {
                            if (!prev) return null;
                            const newSkills = [...prev.skills];
                            newSkills.splice(sIdx, 1);
                            return { ...prev, skills: newSkills };
                          });
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 font-bold"
                      >
                        🗑️
                      </button>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-[#00ff88]">
                          {skill.type} — {skill.name || `Habilidade ${sIdx + 1}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Nome da Habilidade</label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingHero((prev) => {
                                if (!prev) return null;
                                const newSkills = [...prev.skills];
                                newSkills[sIdx] = { ...newSkills[sIdx], name: val };
                                return { ...prev, skills: newSkills };
                              });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff88]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Tipo de Habilidade</label>
                          <select
                            value={skill.type}
                            onChange={(e) => {
                              const val = e.target.value as SkillType;
                              setEditingHero((prev) => {
                                if (!prev) return null;
                                const newSkills = [...prev.skills];
                                newSkills[sIdx] = { ...newSkills[sIdx], type: val };
                                return { ...prev, skills: newSkills };
                              });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff88]"
                          >
                            <option value="Ultimate">Ultimate (Suprema)</option>
                            <option value="Ativa">Ativa (Tática)</option>
                            <option value="Passiva">Passiva</option>
                            <option value="Ataque Automático">Ataque Automático (Básico)</option>
                            <option value="Habilidade de Suporte">Habilidade de Suporte (Auxiliar)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Tempo de Recarga</label>
                          <input
                            type="text"
                            value={skill.cooldown || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingHero((prev) => {
                                if (!prev) return null;
                                const newSkills = [...prev.skills];
                                newSkills[sIdx] = { ...newSkills[sIdx], cooldown: val };
                                return { ...prev, skills: newSkills };
                              });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff88]"
                            placeholder="Ex: 16s"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Descrição Base</label>
                        <textarea
                          rows={2}
                          value={skill.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingHero((prev) => {
                              if (!prev) return null;
                              const newSkills = [...prev.skills];
                              newSkills[sIdx] = { ...newSkills[sIdx], description: val };
                              return { ...prev, skills: newSkills };
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00ff88]"
                        />
                      </div>

                      {/* PROGRESSÃO DE ESTRELAS */}
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">Marcos de Estrela (Progression)</span>
                          {(!skill.progression || skill.progression.length < 10) && (
                            <button
                              onClick={() => {
                                setEditingHero((prev) => {
                                  if (!prev) return null;
                                  const newSkills = [...prev.skills];
                                  const currentProgression = newSkills[sIdx].progression || [];
                                  if (currentProgression.length >= 10) return prev;
                                  newSkills[sIdx] = { 
                                    ...newSkills[sIdx], 
                                    progression: [...currentProgression, { starLevel: "2⭐", starsRequired: 2, title: "", description: "" }] 
                                  };
                                  return { ...prev, skills: newSkills };
                                });
                              }}
                              className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-1 rounded hover:bg-amber-500/30 transition-colors"
                            >
                              + Adicionar Efeito
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {skill.progression?.map((prog, pIdx) => (
                            <div key={pIdx} className="flex gap-2 items-start bg-slate-950/50 p-2 rounded-lg border border-slate-700">
                              <div className="w-24 flex-shrink-0">
                                <select
                                  value={prog.starsRequired}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setEditingHero(prev => {
                                      if (!prev) return null;
                                      const newSkills = [...prev.skills];
                                      const newProg = [...(newSkills[sIdx].progression || [])];
                                      newProg[pIdx] = { ...newProg[pIdx], starsRequired: val, starLevel: formatStarLabel(val) };
                                      newSkills[sIdx] = { ...newSkills[sIdx], progression: newProg };
                                      return { ...prev, skills: newSkills };
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-white focus:outline-none focus:border-amber-500"
                                >
                                  {getAvailableStarOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={prog.title || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingHero(prev => {
                                      if (!prev) return null;
                                      const newSkills = [...prev.skills];
                                      const newProg = [...(newSkills[sIdx].progression || [])];
                                      newProg[pIdx] = { ...newProg[pIdx], title: val };
                                      newSkills[sIdx] = { ...newSkills[sIdx], progression: newProg };
                                      return { ...prev, skills: newSkills };
                                    });
                                  }}
                                  placeholder="Título do efeito..."
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-white focus:outline-none focus:border-amber-500"
                                />
                                <input
                                  type="text"
                                  value={prog.description}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingHero(prev => {
                                      if (!prev) return null;
                                      const newSkills = [...prev.skills];
                                      const newProg = [...(newSkills[sIdx].progression || [])];
                                      newProg[pIdx] = { ...newProg[pIdx], description: val };
                                      newSkills[sIdx] = { ...newSkills[sIdx], progression: newProg };
                                      return { ...prev, skills: newSkills };
                                    });
                                  }}
                                  placeholder="Descrição do aprimoramento..."
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  setEditingHero(prev => {
                                    if (!prev) return null;
                                    const newSkills = [...prev.skills];
                                    const newProg = [...(newSkills[sIdx].progression || [])];
                                    newProg.splice(pIdx, 1);
                                    newSkills[sIdx] = { ...newSkills[sIdx], progression: newProg };
                                    return { ...prev, skills: newSkills };
                                  });
                                }}
                                className="text-slate-500 hover:text-red-400 text-xs px-1"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {editingHero.skills.length < 5 && (
                    <button
                      onClick={() => {
                        setEditingHero(prev => {
                          if (!prev) return null;
                          const newSkills = [...prev.skills];
                          newSkills.push({
                            id: `${prev.id}-skill-${newSkills.length + 1}`,
                            name: `Nova Habilidade`,
                            type: "Ativa",
                            description: "Nova habilidade",
                            damageType: prev.damageType,
                            progression: []
                          });
                          return { ...prev, skills: newSkills };
                        });
                      }}
                      className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-[#00ff88] hover:border-[#00ff88] transition-colors"
                    >
                      + Adicionar Habilidade ({editingHero.skills.length}/5)
                    </button>
                  )}
                </div>
              )}

              {/* ABA 5: SINERGIAS E RELAÇÕES */}
              {modalTab === "sinergias" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Alta Sinergia (Composição Favorável)</h4>
                    <p className="text-xs text-slate-400 mb-4">Selecione os heróis que formam as melhores combinações com {editingHero.name}.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-900/50">
                      {heroes.filter(h => h.id !== editingHero.id).map(h => {
                        const isSelected = editingHero.combatProfile.synergyWith?.includes(h.slug);
                        return (
                          <label key={`syn-${h.id}`} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                setEditingHero(prev => {
                                  if (!prev) return null;
                                  const list = prev.combatProfile.synergyWith || [];
                                  const newList = e.target.checked ? [...list, h.slug] : list.filter(slug => slug !== h.slug);
                                  return { ...prev, combatProfile: { ...prev.combatProfile, synergyWith: newList } };
                                });
                              }}
                              className="hidden"
                            />
                            <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                              {h.avatarUrl ? <img src={h.avatarUrl} alt={h.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">{h.name[0]}</div>}
                            </div>
                            <div className="text-[10px]">
                              <div className="font-bold text-white truncate max-w-[80px]">{h.name}</div>
                              <div className="text-slate-400">{h.faction}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Heróis que Anulam (Counters)</h4>
                    <p className="text-xs text-slate-400 mb-4">Selecione os heróis que são efetivos contra {editingHero.name}.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-900/50">
                      {heroes.filter(h => h.id !== editingHero.id).map(h => {
                        const isSelected = editingHero.combatProfile.counteredBy?.includes(h.slug);
                        return (
                          <label key={`ctr-${h.id}`} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                setEditingHero(prev => {
                                  if (!prev) return null;
                                  const list = prev.combatProfile.counteredBy || [];
                                  const newList = e.target.checked ? [...list, h.slug] : list.filter(slug => slug !== h.slug);
                                  return { ...prev, combatProfile: { ...prev.combatProfile, counteredBy: newList } };
                                });
                              }}
                              className="hidden"
                            />
                            <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                              {h.avatarUrl ? <img src={h.avatarUrl} alt={h.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">{h.name[0]}</div>}
                            </div>
                            <div className="text-[10px]">
                              <div className="font-bold text-white truncate max-w-[80px]">{h.name}</div>
                              <div className="text-slate-400">{h.faction}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 6: CALCULADORAS & FONTES */}
              {modalTab === "calculadoras" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Link Calculadora Antitoxinas</label>
                      <input
                        type="text"
                        value={editingHero.calculatorLinks.antitoxinUrl}
                        onChange={(e) =>
                          setEditingHero((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  calculatorLinks: {
                                    ...prev.calculatorLinks,
                                    antitoxinUrl: e.target.value,
                                  },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Link Calculadora Fragmentos</label>
                      <input
                        type="text"
                        value={editingHero.calculatorLinks.shardsUrl}
                        onChange={(e) =>
                          setEditingHero((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  calculatorLinks: {
                                    ...prev.calculatorLinks,
                                    shardsUrl: e.target.value,
                                  },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Link Calculadora Insígnias</label>
                      <input
                        type="text"
                        value={editingHero.calculatorLinks.badgesUrl}
                        onChange={(e) =>
                          setEditingHero((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  calculatorLinks: {
                                    ...prev.calculatorLinks,
                                    badgesUrl: e.target.value,
                                  },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">URLs de Fontes de Dados (1 por linha)</label>
                    <textarea
                      rows={3}
                      value={rawSourceUrlsInput}
                      onChange={(e) => setRawSourceUrlsInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00ff88]"
                      placeholder="https://lastasylumplague.com/heroes/..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div>
                {!isNewHero && (
                  <button
                    onClick={() => handleDeleteHero(editingHero)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs hover:bg-red-500/20 border border-red-500/30 transition-colors"
                  >
                    Excluir Herói
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHero}
                  disabled={savingHero || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {savingHero ? "Gravando..." : "Salvar Configurações"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

