'use client';

import { useState, useEffect } from 'react';

export interface SocialShareBarProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'inline' | 'card' | 'pill';
  text?: string;
}

/**
 * Sanitiza e valida URLs para compartilhamento, prevenindo pseudo-protocolos perigosos
 * como javascript:, data:, vbscript:, etc.
 */
function sanitizeShareUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (/^(javascript|data|vbscript|file|blob):/i.test(trimmed)) {
    return '';
  }
  try {
    const baseOrigin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://lastasylumplague.com';
    const parsed = new URL(trimmed, baseOrigin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return '';
  }
  return '';
}

export function SocialShareBar({ url, title, description = '', variant = 'inline', text = 'Compartilhe' }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const safeUrl = sanitizeShareUrl(url);
  const cleanTitle = (title || '').trim();
  const cleanDescription = (description || '').trim();

  const encodedUrl = encodeURIComponent(safeUrl);
  const encodedTitle = encodeURIComponent(cleanTitle);
  const whatsappMessage = cleanTitle ? `${cleanTitle} - ${safeUrl}` : safeUrl;
  const encodedWhatsapp = encodeURIComponent(whatsappMessage);

  const handleCopy = async () => {
    const targetText = safeUrl || url;
    if (!targetText) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(targetText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = targetText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      }
    } catch (err) {
      console.error('Erro ao copiar link para a área de transferência:', err);
    }
  };

  const handleNativeShare = async () => {
    const targetUrl = safeUrl || url;
    if (!targetUrl || !canNativeShare) return;

    const shareData: ShareData = {
      title: cleanTitle,
      text: cleanDescription || cleanTitle,
      url: targetUrl,
    };

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } else if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }
      await handleCopy();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Erro no compartilhamento nativo:', err);
      await handleCopy();
    }
  };

  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedWhatsapp}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };

  const containerClasses = {
    inline: 'flex flex-row items-center gap-2',
    card: 'flex flex-col items-center gap-4 p-6 bg-[#080c14] border border-slate-800 rounded-xl shadow-[0_0_15px_rgba(0,255,136,0.1)]',
    pill: 'flex flex-row items-center justify-center gap-2 p-1 bg-[#101623] border border-slate-800 rounded-full w-max mx-auto md:mx-0'
  };

  const btnClasses = "flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95";

  return (
    <div className={containerClasses[variant]}>
      {variant === 'card' && (
        <h3 className="text-lg font-bold text-slate-200">{text}</h3>
      )}
      <div className="flex flex-row flex-wrap items-center justify-center gap-2">
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={btnClasses + " bg-[#25D366] hover:shadow-[0_0_10px_#25D366]"} aria-label="Compartilhar no WhatsApp" title="WhatsApp">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href={links.telegram} target="_blank" rel="noopener noreferrer" className={btnClasses + " bg-[#0088cc] hover:shadow-[0_0_10px_#0088cc]"} aria-label="Compartilhar no Telegram" title="Telegram">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-17.717c.504-.153.957.34.815.84l-2.617 11.968c-.143.597-.83.823-1.312.441l-3.86-3.054-2.127 2.083c-.234.229-.623.167-.76-.134l-1.39-4.84-4.578-1.503c-.482-.158-.456-.843.037-.965l15.792-4.836z"/></svg>
        </a>
        <a href={links.twitter} target="_blank" rel="noopener noreferrer" className={btnClasses + " bg-black border border-slate-700 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"} aria-label="Compartilhar no X (Twitter)" title="X / Twitter">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href={links.facebook} target="_blank" rel="noopener noreferrer" className={btnClasses + " bg-[#1877F2] hover:shadow-[0_0_10px_#1877F2]"} aria-label="Compartilhar no Facebook" title="Facebook">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <button onClick={handleCopy} className={btnClasses + " bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 relative group"} aria-label="Copiar link" title="Copiar Link">
          {copied ? (
            <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          )}
          {copied && (
            <span className="absolute -top-10 bg-[#00ff88] text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap animate-in fade-in duration-200">
              Link copiado!
            </span>
          )}
        </button>
        {canNativeShare && (
          <button onClick={handleNativeShare} className={btnClasses + " bg-[#101623] border border-[#00e5ff] text-[#00e5ff] hover:shadow-[0_0_10px_#00e5ff]"} aria-label="Compartilhar nativo" title="Mais opções">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          </button>
        )}
      </div>
    </div>
  );
}
