"use client";

import { useState } from "react";
import Image from "next/image";
import {
  calcularAntitoxinTotal,
  calcularShardsTotal,
  calcularSkillBadgesTotal,
} from "@/lib/calculators";

// COMPONENTE DE ILUSTRAÇÃO VISUAL DAS 5 ESTRELAS (DIVISÃO POR PERNAS DE 0.2 A 1.0)
function StarDisplay({
  val,
  onLegClick,
  onTierChange,
}: {
  val: number;
  onLegClick?: (value: number) => void;
  onTierChange?: (isRed: boolean) => void;
}) {
  const isRed = val > 5.0;
  const effectiveVal = isRed ? Number((val - 5.0).toFixed(1)) : val;

  const fullStars = Math.floor(effectiveVal);
  const fraction = Number((effectiveVal - fullStars).toFixed(1));

  // ORDEM DAS FRAÇÕES DE ACORDO COM A SOLICITAÇÃO:
  // 0.2: Centro Superior
  // 0.4: Esquerda Superior
  // 0.6: Esquerda Inferior
  // 0.8: Direita Inferior
  // 1.0: Direita Superior
  const legs = [
    {
      req: 0.2,
      dLight: "M 12,12.5 L 8.94,8.29 L 12,2.5 Z",
      dDark: "M 12,12.5 L 12,2.5 L 15.06,8.29 Z",
      name: "Centro Superior",
      yLight: "#FEF6B3",
      yDark: "#FDC029",
      rLight: "#FCA5A5",
      rDark: "#EF4444"
    },
    {
      req: 0.4,
      dLight: "M 12,12.5 L 7.05,14.11 L 2.49,9.41 Z",
      dDark: "M 12,12.5 L 2.49,9.41 L 8.94,8.29 Z",
      name: "Esquerda Superior",
      yLight: "#FDC029",
      yDark: "#FEF6B3",
      rLight: "#EF4444",
      rDark: "#FCA5A5"
    },
    {
      req: 0.6,
      dLight: "M 12,12.5 L 12,17.70 L 6.12,20.59 Z",
      dDark: "M 12,12.5 L 6.12,20.59 L 7.05,14.11 Z",
      name: "Esquerda Inferior",
      yLight: "#C98E08",
      yDark: "#FDC029",
      rLight: "#B91C1C",
      rDark: "#EF4444"
    },
    {
      req: 0.8,
      dLight: "M 12,12.5 L 16.95,14.11 L 17.88,20.59 Z",
      dDark: "M 12,12.5 L 17.88,20.59 L 12,17.70 Z",
      name: "Direita Inferior",
      yLight: "#D69906",
      yDark: "#AD701C",
      rLight: "#DC2626",
      rDark: "#7F1D1D"
    },
    {
      req: 1.0,
      dLight: "M 12,12.5 L 15.06,8.29 L 21.51,9.41 Z",
      dDark: "M 12,12.5 L 21.51,9.41 L 16.95,14.11 Z",
      name: "Direita Superior",
      yLight: "#FFF380",
      yDark: "#FDC029",
      rLight: "#FECACA",
      rDark: "#EF4444"
    },
  ];

  return (
    <div className="py-2 space-y-2">
      {/* SELETOR DE FAIXA DE ESTRELAS: AMARELAS (1-5) VS VERMELHAS (6-10) */}
      {onTierChange && (
        <div className="flex items-center justify-center gap-2 mb-1">
          <button
            type="button"
            onClick={() => onTierChange(false)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
              !isRed
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
            }`}
          >
            ★ Amarelas (0-5)
          </button>
          <button
            type="button"
            onClick={() => onTierChange(true)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
              isRed
                ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)]"
                : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
            }`}
          >
            ★ Vermelhas (6-10)
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = starIndex <= fullStars;
          const isCurrentFractional = starIndex === fullStars + 1;

          return (
            <div key={starIndex} className="relative flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-9 sm:h-9 transition-all duration-300"
                viewBox="0 0 24 24"
              >
                {legs.map((leg, legIdx) => {
                  let isActive = false;
                  if (isFull) {
                    isActive = true;
                  } else if (isCurrentFractional) {
                    isActive = fraction >= leg.req;
                  }

                  const activeFillLight = isRed ? leg.rLight : leg.yLight;
                  const activeFillDark = isRed ? leg.rDark : leg.yDark;
                  const inactiveFillLight = "#374151";
                  const inactiveFillDark = "#1f2937";

                  const activeStroke = isRed ? "#b91c1c" : "#d97706";
                  const inactiveStroke = isRed ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)";

                  const handlePathClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (onLegClick) {
                      const clickedVal = (isRed ? 5.0 : 0.0) + (starIndex - 1) + leg.req;
                      onLegClick(Number(clickedVal.toFixed(1)));
                    }
                  };

                  return (
                    <g
                      key={legIdx}
                      onClick={handlePathClick}
                      role={onLegClick ? "button" : undefined}
                      tabIndex={onLegClick ? 0 : undefined}
                      className={onLegClick ? "cursor-pointer hover:opacity-80 touch-manipulation select-none" : ""}
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 0 1.5px ${isRed ? "rgba(185, 28, 28, 0.85)" : "rgba(217, 119, 6, 0.85)"})`
                          : "none",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      {/* Metade Esquerda (Brilho / Clara) */}
                      <path
                        d={leg.dLight}
                        fill={isActive ? activeFillLight : inactiveFillLight}
                        stroke={isActive ? activeStroke : inactiveStroke}
                        strokeWidth={isFull ? "0" : "0.5"}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {/* Metade Direita (Sombra / Escura) */}
                      <path
                        d={leg.dDark}
                        fill={isActive ? activeFillDark : inactiveFillDark}
                        stroke={isActive ? activeStroke : inactiveStroke}
                        strokeWidth={isFull ? "0" : "0.5"}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Calculators() {
  // 1. ESTADO ANTITOXINA
  const [nivelAtual, setNivelAtual] = useState(1);
  const [nivelDesejado, setNivelDesejado] = useState(50);
  const [nivelAtualInput, setNivelAtualInput] = useState("1");
  const [nivelDesejadoInput, setNivelDesejadoInput] = useState("50");

  // 2. ESTADO ESTRELAS (STEP DE 0.2)
  const [estrelaAtual, setEstrelaAtual] = useState(0.0);
  const [estrelaDesejada, setEstrelaDesejada] = useState(5.0);
  const [estrelaAtualInput, setEstrelaAtualInput] = useState("0.0");
  const [estrelaDesejadaInput, setEstrelaDesejadaInput] = useState("5.0");

  // 3. ESTADO HABILIDADES (BADGES)
  const [skillAtual, setSkillAtual] = useState(1);
  const [skillDesejada, setSkillDesejada] = useState(10);
  const [skillAtualInput, setSkillAtualInput] = useState("1");
  const [skillDesejadaInput, setSkillDesejadaInput] = useState("10");

  const resAntitoxina = calcularAntitoxinTotal(nivelAtual, nivelDesejado);
  const resShards = calcularShardsTotal(estrelaAtual, estrelaDesejada);
  const resSkill = calcularSkillBadgesTotal(skillAtual, skillDesejada);

  // FUNÇÕES DE ATUALIZAÇÃO E SINCRONIZAÇÃO DE INPUTS
  const updateNivelAtual = (newVal: number) => {
    setNivelAtual(newVal);
    setNivelAtualInput(newVal.toString());
  };

  const updateNivelDesejado = (newVal: number) => {
    setNivelDesejado(newVal);
    setNivelDesejadoInput(newVal.toString());
  };

  const setNivelAtualCombined = (val: number) => {
    updateNivelAtual(val);
    if (val >= nivelDesejado) {
      updateNivelDesejado(Math.min(148, val + 1));
    }
  };

  const setNivelDesejadoCombined = (val: number) => {
    updateNivelDesejado(val);
    if (val <= nivelAtual) {
      updateNivelAtual(Math.max(1, val - 1));
    }
  };

  const handleNivelAtualInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setNivelAtualInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      setNivelAtual(parsed);
    }
  };

  const handleNivelAtualBlur = () => {
    let val = parseInt(nivelAtualInput, 10);
    if (isNaN(val)) val = 1;
    val = Math.max(1, Math.min(147, val));
    setNivelAtualCombined(val);
  };

  const handleNivelDesejadoInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setNivelDesejadoInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      setNivelDesejado(parsed);
    }
  };

  const handleNivelDesejadoBlur = () => {
    let val = parseInt(nivelDesejadoInput, 10);
    if (isNaN(val)) val = 148;
    val = Math.max(2, Math.min(148, val));
    setNivelDesejadoCombined(val);
  };

  const updateEstrelaAtual = (newVal: number) => {
    setEstrelaAtual(newVal);
    setEstrelaAtualInput(newVal.toFixed(1));
  };

  const updateEstrelaDesejada = (newVal: number) => {
    setEstrelaDesejada(newVal);
    setEstrelaDesejadaInput(newVal.toFixed(1));
  };

  const setEstrelaAtualCombined = (val: number) => {
    const rounded = Number((Math.round(val * 5) / 5).toFixed(1));
    const cleanAtual = Math.max(0.0, Math.min(9.8, rounded));
    updateEstrelaAtual(cleanAtual);
    if (cleanAtual >= estrelaDesejada) {
      const nextDesejada = Number((Math.min(10.0, cleanAtual + 0.2)).toFixed(1));
      updateEstrelaDesejada(nextDesejada);
    }
  };

  const setEstrelaDesejadaCombined = (val: number) => {
    const rounded = Number((Math.round(val * 5) / 5).toFixed(1));
    const cleanDesejada = Math.max(0.2, Math.min(10.0, rounded));
    updateEstrelaDesejada(cleanDesejada);
    if (cleanDesejada <= estrelaAtual) {
      const prevAtual = Number((Math.max(0.0, cleanDesejada - 0.2)).toFixed(1));
      updateEstrelaAtual(prevAtual);
    }
  };

  const handleEstrelaAtualInputChange = (val: string) => {
    const normalized = val.replace(",", ".");
    const cleaned = normalized.replace(/[^\d.]/g, "");
    setEstrelaAtualInput(cleaned);
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      const cleanVal = Math.max(0.0, Math.min(9.8, parsed));
      setEstrelaAtual(cleanVal);
      if (cleanVal >= estrelaDesejada) {
        const nextDesejada = Number((Math.min(10.0, cleanVal + 0.2)).toFixed(1));
        setEstrelaDesejada(nextDesejada);
        setEstrelaDesejadaInput(nextDesejada.toFixed(1));
      }
    }
  };

  const handleEstrelaAtualBlur = () => {
    const normalized = estrelaAtualInput.replace(",", ".");
    let val = parseFloat(normalized);
    if (isNaN(val)) val = 0.0;
    val = Math.max(0.0, Math.min(9.8, val));
    const rounded = Number((Math.round(val * 5) / 5).toFixed(1));
    setEstrelaAtualCombined(rounded);
  };

  const handleEstrelaDesejadaInputChange = (val: string) => {
    const normalized = val.replace(",", ".");
    const cleaned = normalized.replace(/[^\d.]/g, "");
    setEstrelaDesejadaInput(cleaned);
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      const cleanVal = Math.max(0.2, Math.min(10.0, parsed));
      setEstrelaDesejada(cleanVal);
      if (cleanVal <= estrelaAtual) {
        const prevAtual = Number((Math.max(0.0, cleanVal - 0.2)).toFixed(1));
        setEstrelaAtual(prevAtual);
        setEstrelaAtualInput(prevAtual.toFixed(1));
      }
    }
  };

  const handleEstrelaDesejadaBlur = () => {
    const normalized = estrelaDesejadaInput.replace(",", ".");
    let val = parseFloat(normalized);
    if (isNaN(val)) val = 10.0;
    val = Math.max(0.2, Math.min(10.0, val));
    const rounded = Number((Math.round(val * 5) / 5).toFixed(1));
    setEstrelaDesejadaCombined(rounded);
  };

  const toggleEstrelaAtualTier = (toRed: boolean) => {
    if (toRed && estrelaAtual <= 5.0) {
      setEstrelaAtualCombined(Number((estrelaAtual + 5.0).toFixed(1)));
    } else if (!toRed && estrelaAtual > 5.0) {
      setEstrelaAtualCombined(Number((estrelaAtual - 5.0).toFixed(1)));
    }
  };

  const toggleEstrelaDesejadaTier = (toRed: boolean) => {
    if (toRed && estrelaDesejada <= 5.0) {
      setEstrelaDesejadaCombined(Number((estrelaDesejada + 5.0).toFixed(1)));
    } else if (!toRed && estrelaDesejada > 5.0) {
      setEstrelaDesejadaCombined(Number((estrelaDesejada - 5.0).toFixed(1)));
    }
  };

  const incEstrela = (val: number, max: number) => Number(Math.min(max, val + 0.2).toFixed(1));
  const decEstrela = (val: number, min: number) => Number(Math.max(min, val - 0.2).toFixed(1));

  const updateSkillAtual = (newVal: number) => {
    setSkillAtual(newVal);
    setSkillAtualInput(newVal.toString());
  };

  const updateSkillDesejada = (newVal: number) => {
    setSkillDesejada(newVal);
    setSkillDesejadaInput(newVal.toString());
  };

  const setSkillAtualCombined = (val: number) => {
    updateSkillAtual(val);
    if (val >= skillDesejada) {
      updateSkillDesejada(Math.min(22, val + 1));
    }
  };

  const setSkillDesejadaCombined = (val: number) => {
    updateSkillDesejada(val);
    if (val <= skillAtual) {
      updateSkillAtual(Math.max(1, val - 1));
    }
  };

  const handleSkillAtualInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setSkillAtualInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      setSkillAtual(parsed);
    }
  };

  const handleSkillAtualBlur = () => {
    let val = parseInt(skillAtualInput, 10);
    if (isNaN(val)) val = 1;
    val = Math.max(1, Math.min(21, val));
    setSkillAtualCombined(val);
  };

  const handleSkillDesejadaInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setSkillDesejadaInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      setSkillDesejada(parsed);
    }
  };

  const handleSkillDesejadaBlur = () => {
    let val = parseInt(skillDesejadaInput, 10);
    if (isNaN(val)) val = 22;
    val = Math.max(2, Math.min(22, val));
    setSkillDesejadaCombined(val);
  };

  return (
    <section className="relative py-12 sm:py-20 bg-transparent overflow-hidden">
      {/* GLOW DECORATIVO DE FUNDO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00ff88]/5 rounded-full blur-[180px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TÍTULO DA PÁGINA DE CALCULADORAS */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h4m-6-10h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            <span>Central de Otimização e Recursos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Calculadoras de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00e5ff] toxic-text-glow">Upgrades</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-400">
            Calcule os custos exatos de Nível, Estrelas e Habilidades para planejar seus heróis.
          </p>
        </div>

        {/* GRID DE CARDS PARA CADA PROCESSO DE CÁLCULO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* ======================================================== */}
          {/* CARD 1: CALCULADORA DE ANTITOXINAS (LEVEL UPGRADES)      */}
          {/* ======================================================== */}
          <div className="rounded-3xl bg-[#101623]/90 border border-[#00ff88]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col justify-between">
            
            {/* 1. TOPO DO CARD: IMAGEM REPRESENTATIVA */}
            <div className="relative w-full h-44 bg-gradient-to-b from-slate-900 to-[#101623] p-5 flex items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-[#00ff88]/5 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-24 h-24 drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                  <Image
                    src="/images/antitoxin_image.webp"
                    alt="Frasco de Antitoxina"
                    fill
                    sizes="96px"
                    className="object-contain"
                    style={{ transform: "rotate(-35deg)" }}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ff88] font-bold">
                    Heróis
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    Antitoxinas (Nível)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Níveis 1 ao 148
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ÁREA DE CONFIGURAÇÃO DE NÍVEL */}
            <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* NÍVEL INICIAL */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Nível Inicial
                    </span>
                    <span className="text-xs font-mono text-[#00ff88]">Nível {nivelAtual}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateNivelAtual(Math.max(1, nivelAtual - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={nivelAtualInput}
                      onChange={(e) => handleNivelAtualInputChange(e.target.value)}
                      onBlur={handleNivelAtualBlur}
                      className="w-full h-10 text-center text-xl font-extrabold text-white bg-slate-950 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => setNivelAtualCombined(Math.min(147, nivelAtual + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* NÍVEL DESEJADO */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Nível Desejado
                    </span>
                    <span className="text-xs font-mono text-emerald-400">Nível {nivelDesejado}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNivelDesejadoCombined(Math.max(2, nivelDesejado - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={nivelDesejadoInput}
                      onChange={(e) => handleNivelDesejadoInputChange(e.target.value)}
                      onBlur={handleNivelDesejadoBlur}
                      className="w-full h-10 text-center text-xl font-extrabold text-white bg-slate-950 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => updateNivelDesejado(Math.min(148, nivelDesejado + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. CAMPO DE RESULTADO */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-[#00ff88]/40 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Total de Antitoxinas
                </span>

                {resAntitoxina.erro ? (
                  <span className="text-red-400 text-xs font-semibold">{resAntitoxina.erro}</span>
                ) : (
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="relative w-9 h-9 flex-shrink-0">
                      <Image
                        src="/images/antitoxin_image.webp"
                        alt="Icone Antitoxina"
                        fill
                        sizes="36px"
                        className="object-contain"
                        style={{ transform: "rotate(-35deg)" }}
                      />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-[#00ff88] toxic-text-glow tracking-tight">
                      {resAntitoxina.totalFormatado}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* ======================================================== */}
          {/* CARD 2: CALCULADORA DE ESTRELAS (FRAÇÕES DE 0.2 A 10.0)  */}
          {/* ======================================================== */}
          <div className="rounded-3xl bg-[#101623]/90 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col justify-between">
            
            {/* 1. TOPO DO CARD: IMAGEM REPRESENTATIVA */}
            <div className="relative w-full h-44 bg-gradient-to-b from-slate-900 to-[#101623] p-5 flex items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-amber-500/5 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-24 h-24 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  <Image
                    src="/images/recruit_shard.webp"
                    alt="Fragmento de Herói"
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Estrelas
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    Fragmentos de Herói
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Passos de 0.2 (0.0 a 10.0)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ÁREA DE CONFIGURAÇÃO DE ESTRELAS */}
            <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* ESTRELAS ATUAIS */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Estrelas Atuais
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {estrelaAtual.toFixed(1)} ⭐
                    </span>
                  </div>

                  {/* ILUSTRAÇÃO DAS ESTRELAS ATUAIS */}
                  <StarDisplay
                    val={estrelaAtual}
                    onLegClick={setEstrelaAtualCombined}
                    onTierChange={toggleEstrelaAtualTier}
                  />

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEstrelaAtualCombined(decEstrela(estrelaAtual, 0.0))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      value={estrelaAtualInput}
                      onChange={(e) => handleEstrelaAtualInputChange(e.target.value)}
                      onBlur={handleEstrelaAtualBlur}
                      className="w-full h-10 text-center text-xl font-extrabold text-white bg-slate-950 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    />

                    <button
                      type="button"
                      onClick={() => setEstrelaAtualCombined(incEstrela(estrelaAtual, 9.8))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ESTRELAS DESEJADAS */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Estrelas Desejadas
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {estrelaDesejada.toFixed(1)} ⭐
                    </span>
                  </div>

                  {/* ILUSTRAÇÃO DAS ESTRELAS DESEJADAS */}
                  <StarDisplay
                    val={estrelaDesejada}
                    onLegClick={setEstrelaDesejadaCombined}
                    onTierChange={toggleEstrelaDesejadaTier}
                  />

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEstrelaDesejadaCombined(decEstrela(estrelaDesejada, 0.2))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      value={estrelaDesejadaInput}
                      onChange={(e) => handleEstrelaDesejadaInputChange(e.target.value)}
                      onBlur={handleEstrelaDesejadaBlur}
                      className="w-full h-10 text-center text-xl font-extrabold text-white bg-slate-950 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    />

                    <button
                      type="button"
                      onClick={() => setEstrelaDesejadaCombined(incEstrela(estrelaDesejada, 10.0))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. CAMPO DE RESULTADO */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/40 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
                <span className="block text-xs font-mono text-amber-400 uppercase tracking-widest mb-1.5">
                  Total de Fragmentos Necessários
                </span>

                {resShards.erro ? (
                  <span className="text-red-400 text-xs font-semibold">{resShards.erro}</span>
                ) : (
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="relative w-9 h-9 flex-shrink-0">
                      <Image
                        src="/images/recruit_shard.webp"
                        alt="Icone Fragmento"
                        fill
                        sizes="36px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      {resShards.totalFormatado}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* ======================================================== */}
          {/* CARD 3: CALCULADORA DE HABILIDADES (SKILL BADGES)        */}
          {/* ======================================================== */}
          <div className="rounded-3xl bg-[#101623]/90 border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col justify-between">
            
            {/* 1. TOPO DO CARD: IMAGEM REPRESENTATIVA */}
            <div className="relative w-full h-44 bg-gradient-to-b from-slate-900 to-[#101623] p-5 flex items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-24 h-24 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <Image
                    src="/images/sign_medal.webp"
                    alt="Medalha de Habilidade"
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Habilidades
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    Skill Badges
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Níveis 1 ao 22
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ÁREA DE CONFIGURAÇÃO DE HABILIDADES */}
            <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* NÍVEL ATUAL DE HABILIDADE */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Nível Inicial
                    </span>
                    <span className="text-xs font-mono text-cyan-400">Nível {skillAtual}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSkillAtual(Math.max(1, skillAtual - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={skillAtualInput}
                      onChange={(e) => handleSkillAtualInputChange(e.target.value)}
                      onBlur={handleSkillAtualBlur}
                      className="w-full h-10 text-center text-xl font-extrabold text-white bg-slate-950 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400"
                    />

                    <button
                      type="button"
                      onClick={() => setSkillAtualCombined(Math.min(21, skillAtual + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* NÍVEL DESEJADO DE HABILIDADE */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Nível Desejado
                    </span>
                    <span className="text-xs font-mono text-cyan-400">Nível {skillDesejada}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSkillDesejadaCombined(Math.max(2, skillDesejada - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={skillDesejadaInput}
                      onChange={(e) => handleSkillDesejadaInputChange(e.target.value)}
                      onBlur={handleSkillDesejadaBlur}
                      className="w-full h-10 text-center text-xl font-extrabold text-white bg-slate-950 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400"
                    />

                    <button
                      type="button"
                      onClick={() => updateSkillDesejada(Math.min(22, skillDesejada + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 text-xl font-bold flex items-center justify-center border border-slate-700 select-none cursor-pointer touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. CAMPO DE RESULTADO HABILIDADES */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/40 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
                <span className="block text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">
                  Total de Skill Badges
                </span>

                {resSkill.erro ? (
                  <span className="text-red-400 text-xs font-semibold">{resSkill.erro}</span>
                ) : (
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="relative w-9 h-9 flex-shrink-0">
                      <Image
                        src="/images/sign_medal.webp"
                        alt="Icone Medalha Habilidade"
                        fill
                        sizes="36px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                      {resSkill.totalFormatado}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
