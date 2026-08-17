"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signUpUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function CadastroPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [region, setRegion] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !birthDate || !region) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await signUpUser(
        email,
        password,
        firstName,
        lastName,
        birthDate,
        region
      );

      if (res.success) {
        setSuccess(true);
      } else {
        const errorMsg = typeof res.error === "string"
          ? res.error
          : (res.error ? JSON.stringify(res.error) : "Erro ao realizar cadastro.");
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      setErrorMessage("Ocorreu um erro ao processar o cadastro.");
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
          <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-[#101623]/95 border border-[#00ff88]/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
            
            {/* CABEÇALHO */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                <span>Registro de Jogador</span>
              </div>
              <h2 className="text-2xl font-black text-white">Criar Nova Conta</h2>
              <p className="mt-2 text-xs text-slate-400">
                Junte-se à comunidade do Last Asylum BR para comentar, interagir e organizar suas táticas.
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

            {/* TELA DE SUCESSO */}
            {success ? (
              <div className="space-y-6 text-center">
                <div className="p-5 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-semibold flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 mb-2 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                  </svg>
                  <span className="text-white font-extrabold text-base">E-mail de confirmação enviado!</span>
                  <p className="text-xs text-slate-300 font-normal mt-2 leading-relaxed">
                    {isSupabaseConfigured ? (
                      <>
                        Enviamos um link de ativação seguro para o seu e-mail <strong className="text-[#00ff88]">{email}</strong> através do nosso domínio profissional. Acesse sua caixa de entrada para confirmar seu cadastro.
                      </>
                    ) : (
                      <>
                        Cadastro efetuado com sucesso em modo de teste local (sem e-mail real enviado). Você já pode realizar o login agora!
                      </>
                    )}
                  </p>
                </div>

                <Link
                  href="/login"
                  className="w-full h-12 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] flex items-center justify-center transition-all"
                >
                  Ir para o Login
                </Link>
              </div>
            ) : (
              /* FORMULÁRIO DE CADASTRO */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Fernando"
                      required
                      className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ex: Silva"
                      required
                      className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    E-mail *
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
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      className="w-full h-11 pl-4 pr-12 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Região (Estado) *
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Ex: São Paulo"
                      required
                      className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-900 accent-[#00ff88] mt-0.5"
                    />
                    <span className="text-[11px] text-slate-400 leading-normal">
                      Li e concordo com os{" "}
                      <Link href="/termos" className="text-[#00ff88] underline hover:text-white transition-colors">
                        Termos de Serviço
                      </Link>{" "}
                      e a{" "}
                      <Link href="/privacidade" className="text-[#00ff88] underline hover:text-white transition-colors">
                        Política de Privacidade
                      </Link>{" "}
                      do portal.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Cadastrar Conta</span>
                  )}
                </button>

                <div className="text-center pt-3 border-t border-slate-800/60 mt-4">
                  <span className="text-xs text-slate-400">Já tem uma conta? </span>
                  <Link href="/login" className="text-xs font-bold text-[#00ff88] hover:underline">
                    Fazer Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
