"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Script Global Inteligente de Analytics e Rastreamento de Comportamento.
 * Rastreia de forma automática e não-bloqueante:
 * 1. Cliques em Links Externos (Canais Oficiais, Lojas, Recargas, Parceiros e Redes)
 * 2. Cliques em Códigos de Resgate (Gift Codes) e eventos de cópia
 * 3. Navegação em Guias e Conteúdos
 */
export default function AutoAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Helper de envio não-bloqueante
    const sendEvent = (payload: {
      event_type: "link_click" | "code_copy" | "guide_view";
      url?: string;
      label: string;
      category: string;
      page_location?: string;
      metadata?: Record<string, any>;
    }) => {
      try {
        const fullPayload = {
          ...payload,
          page_location: payload.page_location || window.location.pathname,
          timestamp: new Date().toISOString(),
        };

        const jsonStr = JSON.stringify(fullPayload);

        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([jsonStr], { type: "application/json" });
          navigator.sendBeacon("/api/analytics/track", blob);
        } else {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: jsonStr,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (err) {
        // Silencioso para nunca quebrar a experiência do usuário
        console.debug("[Analytics Tracker Silent Catch]:", err);
      }
    };

    // Heurística de categorização de links externos
    const categorizeLink = (href: string, linkText: string) => {
      const lower = href.toLowerCase();
      const cleanText = linkText.replace(/\s+/g, " ").trim();

      // CANAIS OFICIAIS DO JOGO
      if (lower.includes("globallap.com") || lower.includes("s.globallap.com") || lower.includes("webshop")) {
        return { category: "canais_oficiais", label: "Recarga Oficial (Web Shop 💎)" };
      }
      if (lower.includes("play.google.com")) {
        return { category: "canais_oficiais", label: "Download Android (Play Store)" };
      }
      if (lower.includes("apps.apple.com")) {
        return { category: "canais_oficiais", label: "Download iOS (App Store)" };
      }
      if (lower.includes("discord.com/invite") || lower.includes("discord.com/channels")) {
        return { category: "canais_oficiais", label: "Discord Oficial do Jogo" };
      }

      // REDES SOCIAIS & COMUNIDADE
      if (lower.includes("discord.gg") || cleanText.toLowerCase().includes("comunidade discord")) {
        return { category: "redes", label: "Discord da Comunidade Last Asylum BR" };
      }
      if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
        return { category: "redes", label: cleanText || "Canal no YouTube" };
      }
      if (lower.includes("instagram.com") || lower.includes("twitter.com") || lower.includes("x.com")) {
        return { category: "redes", label: cleanText || "Rede Social" };
      }

      // PARCEIROS E LINKS EXTERNOS DIVERSOS
      return {
        category: "parceiros",
        label: cleanText || href,
      };
    };

    // Listener Global de Cliques (Event Delegation no Document)
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // 1. VERIFICA SE O CLIQUE FOI EM UM LINK <a> OU FILHO DE <a>
      const linkElement = target.closest("a");
      if (linkElement && linkElement.href) {
        const href = linkElement.href;
        const linkText = linkElement.innerText || linkElement.getAttribute("aria-label") || linkElement.title || "";
        const isExternal = href.startsWith("http://") || href.startsWith("https://") ? !href.includes(window.location.host) : false;

        if (isExternal) {
          const { category, label } = categorizeLink(href, linkText);
          sendEvent({
            event_type: "link_click",
            url: href,
            label: label || href,
            category,
          });
          return;
        }

        // Se for um link interno para Guia específico
        if (href.includes("/guias/")) {
          const slug = href.split("/guias/")[1]?.split(/[?#]/)[0];
          if (slug && slug.length > 0) {
            sendEvent({
              event_type: "guide_view",
              url: href,
              label: linkText || `Guia: ${slug}`,
              category: "guias",
              metadata: { slug },
            });
          }
        }
      }

      // 2. VERIFICA SE O CLIQUE FOI EM UM BOTÃO DE COPIAR CÓDIGO OU CARD DE CÓDIGO
      const buttonElement = target.closest("button");
      if (buttonElement) {
        const btnText = (buttonElement.innerText || "").toLowerCase();
        // Se for botão com texto "copiar", "resgatar" ou com atributo de código
        const codeContainer = buttonElement.closest("[data-gift-code]") || buttonElement.parentElement;
        const codeAttribute = buttonElement.getAttribute("data-code") || codeContainer?.getAttribute("data-gift-code");

        if (codeAttribute) {
          sendEvent({
            event_type: "code_copy",
            label: `Código ${codeAttribute.toUpperCase()}`,
            category: "codigos",
            metadata: { code: codeAttribute },
          });
          return;
        }

        if (btnText.includes("copiar") || btnText.includes("código")) {
          // Tenta extrair o texto de código do container pai (fonte mono ou div vizinha)
          const monoElem = codeContainer?.querySelector(".font-mono, [class*='font-mono'], strong, span");
          const extractedText = monoElem ? (monoElem.textContent || "").trim() : "";
          if (extractedText && extractedText.length >= 3 && extractedText.length <= 25 && !extractedText.includes(" ")) {
            sendEvent({
              event_type: "code_copy",
              label: `Código ${extractedText.toUpperCase()}`,
              category: "codigos",
              metadata: { code: extractedText },
            });
          }
        }
      }
    };

    // Listener de Cópia Manual pelo Teclado / Seleção
    const handleGlobalCopy = () => {
      try {
        const selection = window.getSelection()?.toString().trim();
        if (selection && selection.length >= 4 && selection.length <= 20 && !selection.includes(" ") && window.location.pathname.includes("/codigos")) {
          sendEvent({
            event_type: "code_copy",
            label: `Código ${selection.toUpperCase()}`,
            category: "codigos",
            metadata: { code: selection },
          });
        }
      } catch {}
    };

    document.addEventListener("click", handleGlobalClick, { capture: true, passive: true });
    document.addEventListener("copy", handleGlobalCopy, { passive: true });

    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
      document.removeEventListener("copy", handleGlobalCopy);
    };
  }, [pathname]);

  return null; // Componente silencioso / sem interface visual
}
