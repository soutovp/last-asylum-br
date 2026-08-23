"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getSavedSession, logoutAdmin, updateProfileInDatabase, UserSession } from "@/lib/auth";

export default function PerfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Campos de perfil do jogo
  const [characterName, setCharacterName] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [kingdomNumber, setKingdomNumber] = useState<number | "">("");
  const [useCharacterName, setUseCharacterName] = useState(false);

  // Campos de informações pessoais
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [region, setRegion] = useState("");
  
  // Preferências de Mail Marketing (Padrão: true)
  const [receiveNoticias, setReceiveNoticias] = useState(true);
  const [receiveGuias, setReceiveGuias] = useState(true);
  const [receiveCodigos, setReceiveCodigos] = useState(true);
  const [receivePromocionais, setReceivePromocionais] = useState(true);

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const saved = getSavedSession();
    if (!saved) {
      router.push("/login");
    } else {
      setSession(saved);
      setFirstName(saved.firstName || "");
      setLastName(saved.lastName || "");
      setRegion(saved.region || "");
      setCharacterName(saved.characterName || "");
      setCharacterId(saved.characterId || "");
      setKingdomNumber(saved.kingdomNumber !== undefined ? saved.kingdomNumber : "");
      setUseCharacterName(!!saved.useCharacterName);
      setReceiveNoticias(saved.receiveNoticias !== false);
      setReceiveGuias(saved.receiveGuias !== false);
      setReceiveCodigos(saved.receiveCodigos !== false);
      setReceivePromocionais(saved.receivePromocionais !== false);
    }
    setLoading(false);
  }, [router]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem selecionada é muito grande! Escolha um arquivo de no máximo 5MB.");
      return;
    }

    setUploadingAvatar(true);
    setMessage(null);
    try {
      const { compressImageToWebp } = await import("@/lib/imageCompression");
      const optimizedFile = await compressImageToWebp(file, 300, 300, 0.85);

      const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        throw new Error("Configurações de mídia do servidor não encontradas.");
      }

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("upload_preset", cloudinaryUploadPreset);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Falha ao subir imagem para o Cloudinary.");
      }

      const uploadData = await uploadRes.json();
      const newAvatarUrl = uploadData.secure_url;

      const res = await updateProfileInDatabase(session?.id || session?.email || "", { avatarUrl: newAvatarUrl });
      if (res.success && res.session) {
        setSession(res.session);
        window.dispatchEvent(new Event("auth_state_change"));
        setMessage({ type: "success", text: "Foto de perfil atualizada com sucesso!" });
      } else {
        throw new Error(res.error || "Erro ao atualizar foto de perfil.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Erro ao alterar foto: " + err.message });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    // Dispara evento para atualizar header
    window.dispatchEvent(new Event("auth_state_change"));
    router.push("/login");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setUpdating(true);
    setMessage(null);

    const updates = {
      firstName,
      lastName,
      region,
      characterName,
      characterId,
      kingdomNumber: kingdomNumber === "" ? undefined : Number(kingdomNumber),
      useCharacterName,
      receiveNoticias,
      receiveGuias,
      receiveCodigos,
      receivePromocionais,
    };

    try {
      const res = await updateProfileInDatabase(session.id || session.email, updates);
      if (res.success && res.session) {
        setSession(res.session);
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
        // Dispara evento de alteração de auth
        window.dispatchEvent(new Event("auth_state_change"));
      } else {
        setMessage({ type: "error", text: res.error || "Falha ao atualizar o perfil." });
      }
    } catch {
      setMessage({ type: "error", text: "Erro inesperado ao salvar alterações." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 overflow-x-hidden">
      {/* BACKGROUND FIXO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/village_banner_2.png"
          alt="Background Vila"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65 scale-105"
        />
        <div className="absolute inset-0 bg-[#080c14]/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-transparent to-[#080c14]/90"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LADO ESQUERDO: CARTÃO DO USUÁRIO */}
            <div className="md:col-span-1 space-y-6">
              <div className="p-6 rounded-3xl bg-[#101623]/95 border border-slate-800 backdrop-blur-2xl text-center flex flex-col items-center">
                <div 
                  onClick={handleAvatarClick}
                  className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-[#00ff88] mb-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                >
                  <img
                    src={session.avatarUrl || "/images/avatar-default.svg"}
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                  />
                  {/* OVERLAY DE HOVER */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold font-mono transition-opacity uppercase tracking-wider select-none">
                    Alterar
                  </div>
                  {/* LOADING OVERLAY */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-20">
                      <div className="w-5 h-5 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                />

                <button 
                  type="button" 
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="text-[10px] font-mono font-bold text-[#00ff88] hover:underline mb-3 uppercase tracking-wider disabled:opacity-45 cursor-pointer"
                >
                  {uploadingAvatar ? "Carregando..." : "Alterar Foto"}
                </button>

                <h3 className="text-lg font-bold text-white leading-tight">
                  {session.firstName} {session.lastName}
                </h3>
                <span className="text-xs font-mono text-slate-400 mt-1 block">
                  {session.email}
                </span>

                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                    {session.role === "ADM" ? "Administrador" : session.role === "SUPER" ? "Supervisor" : session.role === "R" ? "Redator" : session.role === "E" ? "Editor" : "Jogador"}
                  </span>
                </div>

                {kingdomNumber && (
                  <div className="mt-6 pt-6 border-t border-slate-800/80 w-full flex justify-around text-center">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Reino</span>
                      <span className="text-sm font-bold text-white">#{kingdomNumber}</span>
                    </div>
                    {characterName && (
                      <div className="border-l border-slate-800/80 pl-6">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Personagem</span>
                        <span className="text-sm font-bold text-cyan-400 truncate max-w-[100px] block">{characterName}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-8 w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                >
                  Sair da Conta
                </button>
              </div>
            </div>

            {/* LADO DIREITO: FORMULÁRIO DE CONFIGURAÇÕES */}
            <div className="md:col-span-2">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#101623]/95 border border-slate-800 backdrop-blur-2xl">
                <div className="pb-6 border-b border-slate-800/80">
                  <h2 className="text-xl font-black text-white">Configurações de Perfil</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Gerencie seus dados pessoais, credenciais do jogo e preferências de notificações.
                  </p>
                </div>

                {message && (
                  <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    message.type === "success" 
                      ? "bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {message.type === "success" ? (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="divide-y divide-slate-800/70">
                  {/* SEÇÃO A: DADOS DE JOGO */}
                  <div className="py-6 space-y-4">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0-8a3 3 0 013 3v8a3 3 0 01-3 3H9a3 3 0 01-3-3V7a3 3 0 013-3h6zM9 11h.01M15 11h.01M12 14h.01" />
                      </svg>
                      Credenciais do Jogo (Last Asylum)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Nome do Personagem
                        </label>
                        <input
                          type="text"
                          value={characterName}
                          onChange={(e) => setCharacterName(e.target.value)}
                          placeholder="Ex: AsylumSlayer"
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900/60 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          ID do Personagem (In-Game ID)
                        </label>
                        <input
                          type="text"
                          value={characterId}
                          onChange={(e) => setCharacterId(e.target.value)}
                          placeholder="Ex: 8934729"
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900/60 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Número do Reino
                      </label>
                      <input
                        type="number"
                        value={kingdomNumber}
                        onChange={(e) => setKingdomNumber(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Ex: 145"
                        min={1}
                        className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900/60 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={useCharacterName}
                          onChange={(e) => setUseCharacterName(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 accent-[#00ff88] mt-0.5 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors leading-normal">
                          Utilizar o <strong>Nome do Personagem</strong> em vez do meu Nome Real ao comentar nos artigos.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* SEÇÃO B: DADOS PESSOAIS */}
                  <div className="py-6 space-y-4">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Informações Pessoais
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Nome"
                          required
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900/60 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Sobrenome
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Sobrenome"
                          required
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900/60 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Região (Estado)
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="Ex: São Paulo"
                        required
                        className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900/60 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                      />
                    </div>
                  </div>

                  {/* SEÇÃO C: PREFERÊNCIAS DE E-MAIL */}
                  <div className="py-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-[#00ff88] uppercase tracking-wider flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Preferências de E-mail
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Personalize o que deseja receber do portal em sua caixa de entrada.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setReceiveNoticias(true);
                            setReceiveGuias(true);
                            setReceiveCodigos(true);
                            setReceivePromocionais(true);
                          }}
                          className="text-[10px] font-mono text-[#00ff88] hover:underline cursor-pointer"
                        >
                          Ativar Todos
                        </button>
                        <span className="text-slate-600 text-xs">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiveNoticias(false);
                            setReceiveGuias(false);
                            setReceiveCodigos(false);
                            setReceivePromocionais(false);
                          }}
                          className="text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
                        >
                          Desativar Todos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      
                      {/* NOTÍCIAS */}
                      <label className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 flex items-start justify-between gap-3 cursor-pointer transition-all">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#00ff88] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            Notícias & Atualizações
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Patch notes, novidades e comunicados.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={receiveNoticias}
                          onChange={(e) => setReceiveNoticias(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 accent-[#00ff88] cursor-pointer mt-0.5"
                        />
                      </label>

                      {/* GUIAS */}
                      <label className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 flex items-start justify-between gap-3 cursor-pointer transition-all">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Guias & Tutoriais
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Estratégias e tutoriais avançados.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={receiveGuias}
                          onChange={(e) => setReceiveGuias(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 accent-[#00ff88] cursor-pointer mt-0.5"
                        />
                      </label>

                      {/* CÓDIGOS */}
                      <label className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 flex items-start justify-between gap-3 cursor-pointer transition-all">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#00ff88] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            Códigos de Presente
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Novos Gift Codes com recompensas.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={receiveCodigos}
                          onChange={(e) => setReceiveCodigos(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 accent-[#00ff88] cursor-pointer mt-0.5"
                        />
                      </label>

                      {/* PROMOCIONAIS */}
                      <label className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 flex items-start justify-between gap-3 cursor-pointer transition-all">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                            Envios Especiais
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            Eventos e novidades da comunidade.
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={receivePromocionais}
                          onChange={(e) => setReceivePromocionais(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 accent-[#00ff88] cursor-pointer mt-0.5"
                        />
                      </label>

                    </div>

                    {session.unsubscribeToken && (
                      <div className="pt-2 text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
                        <span>Link de Descadastro Seguro:</span>
                        <Link
                          href={`/unsubscribe/${session.unsubscribeToken}`}
                          target="_blank"
                          className="text-cyan-400 hover:underline"
                        >
                          Visualizar Página Pública de Unsubscribe &rarr;
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full h-11 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? (
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>Salvar Configurações</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
