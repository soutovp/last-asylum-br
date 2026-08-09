"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: string;
  responsive?: string;
}

export default function AdBanner({ slot, format = "auto", responsive = "true" }: AdBannerProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("Erro ao inicializar o AdSense:", err);
    }
  }, []);

  return (
    <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden min-h-[100px] border border-dashed border-slate-800/60 rounded-2xl p-2 bg-slate-900/30">
      <span className="text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-wider">Publicidade</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-8887540917989782"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
