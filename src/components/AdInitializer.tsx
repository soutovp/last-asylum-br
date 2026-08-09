"use client";

import { useEffect } from "react";

export default function AdInitializer() {
  useEffect(() => {
    try {
      // Procura por blocos de anúncios que ainda não foram inicializados
      const ads = document.querySelectorAll("#in-article-ad ins.adsbygoogle:not([data-adsbygoogle-status])");
      if (ads.length > 0) {
        ads.forEach(() => {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        });
      }
    } catch (err) {
      console.error("Erro ao inicializar anúncios in-article:", err);
    }
  }, []);

  return null; // Componente invisível, apenas executa o efeito
}
