"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loginAdmin, resetAdminPassword, getSavedSession, updateUserPassword } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Esqueci minha senha e Redefinição de senha
  const [view, setView] = useState<"login" | "forgot" | "forgot-success" | "reset-password" | "reset-success">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Se já estiver logado, redireciona para o perfil (exceto se for fluxo de redefinição de senha)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (hash.includes("type=recovery") || search.includes("view=reset-password")) {
      setView("reset-password");
      return;
    }

    const session = getSavedSession();
    if (session) {
      router.push("/perfil");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await loginAdmin(email, password);
      if (res.success && res.session) {
        // Redireciona para o perfil após o login
        router.push("/perfil");
        // Força atualização do header
        window.dispatchEvent(new Event("auth_state_change"));
      } else {
        let errorMsg = "Falha na autenticação. Verifique seu e-mail e senha, ou confirme seu cadastro.";
        if (typeof res.error === "string") {
          errorMsg = res.error;
        } else if (res.error && typeof res.error === "object") {
          console.error("Erro detalhado de login/autenticação:", res.error);
          const errObj = res.error as any;
          errorMsg = errObj.message || errObj.error_description || errorMsg;
        }
        setErrorMessage(errorMsg);
      }
    } catch {
      setErrorMessage("Ocorreu um erro ao tentar realizar o login.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage("Por favor, insira o seu e-mail.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await resetAdminPassword(forgotEmail);
      if (res.success) {
        setView("forgot-success");
      } else {
        setErrorMessage(res.error || "E-mail não encontrado no sistema.");
      }
    } catch {
      setErrorMessage("Erro ao tentar recuperar a senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await updateUserPassword(newPassword);
      if (res.success) {
        setView("reset-success");
      } else {
        let errorMsg = "Erro ao atualizar a senha.";
        if (typeof res.error === "string") {
          errorMsg = res.error;
        } else if (res.error && typeof res.error === "object") {
          console.error("Erro detalhado ao atualizar senha:", res.error);
          const errObj = res.error as any;
          errorMsg = errObj.message || errObj.error_description || errorMsg;
        }
        setErrorMessage(errorMsg);
      }
    } catch {
      setErrorMessage("Ocorreu um erro ao tentar redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

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

        <main className="flex-1 flex items-center justify-center py-12 px-4 w-full">
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#101623]/95 border border-[#00ff88]/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
            
            {/* CABEÇALHO DO LOGIN */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                <span>
                  {view === "login" && "Entrar no Portal"}
                  {view === "forgot" && "Recuperação de Senha"}
                  {view === "forgot-success" && "E-mail Enviado"}
                  {view === "reset-password" && "Nova Senha"}
                  {view === "reset-success" && "Senha Alterada"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {view === "login" && "Acessar Conta"}
                {(view === "forgot" || view === "forgot-success") && "Recuperar Acesso"}
                {view === "reset-password" && "Criar Nova Senha"}
                {view === "reset-success" && "Sucesso!"}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                {view === "login" && "Insira suas credenciais para acessar sua área de jogador."}
                {view === "forgot" && "Insira seu e-mail para receber as instruções de recuperação."}
                {view === "forgot-success" && "Enviamos as instruções para o seu e-mail."}
                {view === "reset-password" && "Digite a sua nova senha de acesso de sobrevivente."}
                {view === "reset-success" && "Sua senha foi atualizada. Retorne para fazer o login."}
              </p>
            </div>

            {/* ALERTA DE ERRO */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* VIEW: LOGIN */}
            {view === "login" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@provedor.com"
                    required
                    className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 pl-4 pr-12 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? "Ocultar senha" : "Exibir senha"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.68-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* LINK ESQUECI SENHA */}
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setView("forgot");
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-[#00ff88] transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Entrar</span>
                  )}
                </button>

                <div className="text-center pt-3 border-t border-slate-800/60 mt-4">
                  <span className="text-xs text-slate-400">Não tem uma conta? </span>
                  <Link href="/cadastro" className="text-xs font-bold text-[#00ff88] hover:underline">
                    Cadastre-se
                  </Link>
                </div>
              </form>
            )}

            {/* VIEW: FORGOT PASSWORD */}
            {view === "forgot" && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    E-mail para Recuperação
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu-email@provedor.com"
                    required
                    className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Enviar E-mail de Recuperação</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setView("login");
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    ← Voltar para o Login
                  </button>
                </div>
              </form>
            )}

            {/* VIEW: SUCESSO FORGOT */}
            {view === "forgot-success" && (
              <div className="space-y-6 text-center">
                <div className="p-4 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-semibold flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                  </svg>
                  <span className="text-white font-extrabold text-base">E-mail de recuperação enviado!</span>
                  <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed">
                    Instruções enviadas para <strong className="text-[#00ff88]">{forgotEmail}</strong>. Verifique sua caixa de entrada.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setView("login");
                  }}
                  className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                >
                  Voltar para o Login
                </button>
              </div>
            )}

            {/* VIEW: REDEFINIÇÃO DE SENHA */}
            {view === "reset-password" && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Salvar Nova Senha</span>
                  )}
                </button>
              </form>
            )}

            {/* VIEW: SUCESSO REDEFINIÇÃO */}
            {view === "reset-success" && (
              <div className="space-y-6 text-center">
                <div className="p-4 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-semibold flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-extrabold text-base">Senha Redefinida!</span>
                  <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed">
                    Sua nova senha foi salva e está pronta para uso.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setView("login");
                    window.location.hash = "";
                  }}
                  className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                >
                  Fazer Login Agora
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
