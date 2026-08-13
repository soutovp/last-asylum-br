"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
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
    }
    setLoading(false);
  }, [router]);

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
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#00ff88] mb-4 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                  <img
                    src={session.avatarUrl || "https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

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
              <div className="p-6 sm:p-8 rounded-3xl bg-[#101623]/95 border border-slate-800 backdrop-blur-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white">Configurações de Perfil</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Gerencie seus dados pessoais e adicione suas credenciais do jogo.
                  </p>
                </div>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    message.type === "success" 
                      ? "bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {message.type === "success" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* SEÇÃO A: DADOS DE JOGO */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      🎮 Credenciais do Jogo (Last Asylum)
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
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
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
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
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
                        className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useCharacterName}
                          onChange={(e) => setUseCharacterName(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 accent-[#00ff88] mt-0.5"
                        />
                        <span className="text-[11px] text-slate-400 leading-normal">
                          Utilizar o <strong>Nome do Personagem</strong> em vez do meu Nome Real ao comentar nos artigos.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* SEÇÃO B: DADOS PESSOAIS */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      👤 Informações Pessoais
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
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
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
                          className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
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
                        className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full h-11 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Salvar Configurações</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
