import { ArticleMailData, NewsMailData, CodeMailData } from "./types";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lastasylumbr.com.br";
const LOGO_URL = "https://res.cloudinary.com/orrs3pvy/image/upload/v1787162698/last-asylum-br-logo_frsehl.png";

/**
 * Remove tags HTML e formata texto plano para truncate limpo
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s\s+/g, " ")
    .trim();
}

/**
 * Truncate inteligente preservando palavras inteiras
 */
export function smartTruncate(text: string, maxLength: number = 360): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  const truncated = clean.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

/**
 * Normaliza e sanitiza HTML rico de notícias para compatibilidade máxima com clientes de e-mail
 */
function formatEmailHtmlContent(rawHtml: string): string {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/<p>/gi, '<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.7; color: #cbd5e1;">')
    .replace(/<h2>/gi, '<h2 style="margin: 24px 0 12px 0; font-size: 18px; font-weight: 800; color: #f8fafc; line-height: 1.3;">')
    .replace(/<h3>/gi, '<h3 style="margin: 20px 0 10px 0; font-size: 16px; font-weight: 700; color: #f8fafc; line-height: 1.3;">')
    .replace(/<a /gi, '<a style="color: #00ff88; text-decoration: underline; font-weight: 600;" ')
    .replace(/<ul>/gi, '<ul style="margin: 0 0 16px 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.7;">')
    .replace(/<ol>/gi, '<ol style="margin: 0 0 16px 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.7;">')
    .replace(/<li>/gi, '<li style="margin-bottom: 6px;">')
    .replace(/<blockquote>/gi, '<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #00ff88; background-color: #0b0f19; color: #94a3b8; font-style: italic; border-radius: 0 8px 8px 0;">')
    .replace(/<code>/gi, '<code style="font-family: monospace; background-color: #05080e; padding: 2px 6px; border-radius: 4px; color: #00ff88; font-size: 13px;">');
}

/**
 * Layout base responsivo do e-mail com a identidade visual do Last Asylum BR
 */
export function renderBaseLayout({
  title,
  preheader,
  bodyHtml,
  siteUrl = DEFAULT_SITE_URL,
}: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  siteUrl?: string;
}): string {
  const cleanSiteUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");

  // Preheader space buffer para evitar vazamento de textos do rodapé na pré-visualização da caixa de entrada
  const preheaderSpacer = "&zwnj;&nbsp;".repeat(25);

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; border-radius: 0px !important; }
      .content-padding { padding: 24px 18px !important; }
      .mobile-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
      .header-padding { padding: 24px 18px 18px 18px !important; }
      .footer-padding { padding: 20px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #080c14; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${
    preheader
      ? `<div style="display: none; font-size: 1px; color: #080c14; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
          ${preheader} ${preheaderSpacer}
        </div>`
      : ""
  }
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080c14;">
    <tr>
      <td align="center" style="padding: 24px 10px 36px 10px;">
        <!-- TABELA CONTAINER CENTRALIZADA -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container-table" style="max-width: 600px; background-color: #101623; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.6);">
          
          <!-- CABEÇALHO / HEADER -->
          <tr>
            <td align="center" class="header-padding" style="background: linear-gradient(180deg, #131d2e 0%, #101623 100%); padding: 28px 24px 20px 24px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${cleanSiteUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
                      <img src="${LOGO_URL}" alt="Last Asylum BR" width="160" style="display: block; width: 160px; max-width: 160px; height: auto; border: 0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #00ff88; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">
                      PORTAL OFICIAL DA COMUNIDADE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CORPO PRINCIPAL -->
          <tr>
            <td class="content-padding" style="padding: 32px 28px 28px 28px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- RODAPÉ / FOOTER -->
          <tr>
            <td class="footer-padding" style="background-color: #0c101a; padding: 24px 28px; border-top: 1px solid #1e293b; text-align: center;">
              
              <!-- LINKS DE NAVEGAÇÃO -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${cleanSiteUrl}/guias" target="_blank" rel="noopener noreferrer" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; font-weight: 600;">Guias</a>
                    <span style="color: #334155;">•</span>
                    <a href="${cleanSiteUrl}/noticias" target="_blank" rel="noopener noreferrer" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; font-weight: 600;">Notícias</a>
                    <span style="color: #334155;">•</span>
                    <a href="${cleanSiteUrl}/codigos" target="_blank" rel="noopener noreferrer" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; font-weight: 600;">Códigos</a>
                    <span style="color: #334155;">•</span>
                    <a href="${cleanSiteUrl}/calculadoras" target="_blank" rel="noopener noreferrer" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px; font-weight: 600;">Calculadoras</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6; max-width: 480px;">
                      Este é um e-mail automático enviado por <strong style="color: #94a3b8;">nao-responda@lastasylumbr.com.br</strong>.<br />
                      Por favor, não responda diretamente a esta mensagem. Dúvidas ou suporte? Contate <a href="mailto:contato@lastasylumbr.com.br" style="color: #00ff88; text-decoration: underline; font-weight: 600;">contato@lastasylumbr.com.br</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 10px; color: #475569; letter-spacing: 0.5px;">
                      © ${new Date().getFullYear()} Last Asylum BR. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. TEMPLATE PARA ARTIGO (GUIA DE SOBREVIVÊNCIA / ESTRATÉGIA)
 * Regra: Contém apenas os parágrafos iniciais (truncate inteligente) e botão "Leia Mais"
 */
export function generateArticleEmail(data: ArticleMailData, siteUrl = DEFAULT_SITE_URL): { subject: string; html: string; text: string } {
  const cleanBase = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const cleanSlug = (data.slug || "").replace(/^\/+/, "");
  const articleUrl = `${cleanBase}/guias/${cleanSlug}`;
  const truncatedText = smartTruncate(data.summary || data.content, 350);
  const categoryName = data.category ? data.category.toUpperCase() : "ARTIGO & GUIA";
  const authorInfo = data.authorName ? ` • POR ${data.authorName.toUpperCase()}` : "";
  const subject = `📖 Novo Artigo: ${data.title} - Last Asylum BR`;

  const bodyHtml = `
    <!-- BADGE DE CATEGORIA (CENTRALIZADO VERTICALMENTE) -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td align="center" style="background-color: rgba(0, 255, 136, 0.12); border: 1px solid #00ff88; border-radius: 20px; padding: 6px 14px; vertical-align: middle; text-align: center;">
          <span style="color: #00ff88; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, Helvetica, sans-serif; line-height: 14px; display: inline-block; vertical-align: middle;">
            ${categoryName}${authorInfo}
          </span>
        </td>
      </tr>
    </table>

    <!-- TÍTULO -->
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.35;">
      ${data.title}
    </h1>

    ${
      data.imageUrl
        ? `<!-- IMAGEM DE DESTAQUE COM CONTAINER RESPONSIVO -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td style="border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; background-color: #0b0f19;">
              <img src="${data.imageUrl}" alt="${data.title}" width="544" style="display: block; width: 100%; max-width: 544px; height: auto; border: 0;" />
            </td>
          </tr>
        </table>`
        : ""
    }

    <!-- CONTEÚDO TRUNCADO -->
    <div style="background-color: #0b0f19; border-left: 3px solid #00ff88; padding: 16px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px; word-break: break-word;">
      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #cbd5e1;">
        ${truncatedText}
      </p>
    </div>

    <!-- BOTÃO BULLETPROOF LEIA MAIS (CENTRALIZADO VERTICALMENTE E IMUNE A DARK MODE) -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto 8px auto;">
      <tr>
        <td align="center" bgcolor="#00ff88" style="background-color: #00ff88; border-radius: 10px; text-align: center; vertical-align: middle; padding: 0;">
          <a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="mobile-btn" style="background-color: #00ff88; border: 1px solid #00ff88; border-radius: 10px; color: #080c14 !important; display: block; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; padding: 14px 32px; text-decoration: none !important; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; line-height: 16px; -webkit-text-size-adjust: none;">
            <span style="color: #080c14 !important; text-decoration: none !important; font-weight: 800; font-size: 14px; line-height: 16px;">Ler Artigo Completo &rarr;</span>
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseLayout({
    title: subject,
    preheader: `Confira o novo artigo: ${data.title}`,
    bodyHtml,
    siteUrl,
  });

  const text = `${data.title}\n\n${truncatedText}\n\nLeia o artigo completo em: ${articleUrl}`;

  return { subject, html, text };
}

/**
 * 2. TEMPLATE PARA NOTÍCIA (ATUALIZAÇÕES E PATCH NOTES)
 * Regra: Contém a notícia completa
 */
export function generateNewsEmail(data: NewsMailData, siteUrl = DEFAULT_SITE_URL): { subject: string; html: string; text: string } {
  const cleanBase = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const cleanSlug = (data.slug || "").replace(/^\/+/, "");
  const newsUrl = `${cleanBase}/noticias/${cleanSlug}`;
  const categoryName = data.category ? data.category.toUpperCase() : "NOTÍCIAS & ATUALIZAÇÕES";
  const authorInfo = data.authorName ? ` • POR ${data.authorName.toUpperCase()}` : "";
  const subject = `📢 Notícia: ${data.title} - Last Asylum BR`;

  // Sanitiza e formata todo o HTML rico da notícia com estilos inline consistentes
  const safeContent = formatEmailHtmlContent(data.content || (data.summary ? `<p>${data.summary}</p>` : ""));

  const bodyHtml = `
    <!-- BADGE DE CATEGORIA -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td align="center" style="background-color: rgba(56, 189, 248, 0.12); border: 1px solid #38bdf8; border-radius: 20px; padding: 6px 14px; vertical-align: middle; text-align: center;">
          <span style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, Helvetica, sans-serif; line-height: 14px; display: inline-block; vertical-align: middle;">
            ${categoryName}${authorInfo}
          </span>
        </td>
      </tr>
    </table>

    <!-- TÍTULO -->
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.35;">
      ${data.title}
    </h1>

    ${
      data.imageUrl
        ? `<!-- IMAGEM DE DESTAQUE COM CONTAINER RESPONSIVO -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td style="border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; background-color: #0b0f19;">
              <img src="${data.imageUrl}" alt="${data.title}" width="544" style="display: block; width: 100%; max-width: 544px; height: auto; border: 0;" />
            </td>
          </tr>
        </table>`
        : ""
    }

    <!-- CONTEÚDO COMPLETO DA NOTÍCIA -->
    <div style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin-bottom: 28px; word-break: break-word;">
      ${safeContent}
    </div>

    <!-- BOTÃO BULLETPROOF VER NO PORTAL -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto 8px auto; border-top: 1px solid #1e293b; padding-top: 24px; width: 100%;">
      <tr>
        <td align="center" bgcolor="#38bdf8" style="background-color: #38bdf8; border-radius: 10px; text-align: center; vertical-align: middle; padding: 0;">
          <a href="${newsUrl}" target="_blank" rel="noopener noreferrer" class="mobile-btn" style="background-color: #38bdf8; border: 1px solid #38bdf8; border-radius: 10px; color: #080c14 !important; display: block; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; padding: 14px 28px; text-decoration: none !important; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; line-height: 16px; -webkit-text-size-adjust: none;">
            <span style="color: #080c14 !important; text-decoration: none !important; font-weight: 800; font-size: 14px; line-height: 16px;">Ver Discussão no Portal &rarr;</span>
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseLayout({
    title: subject,
    preheader: `Novidade no Last Asylum: ${data.title}`,
    bodyHtml,
    siteUrl,
  });

  const text = `${data.title}\n\n${stripHtml(data.content || data.summary || "")}\n\nConfira no portal: ${newsUrl}`;

  return { subject, html, text };
}

/**
 * 3. TEMPLATE PARA CÓDIGO (GIFT CODE / CÓDIGO DE RECOMPENSA)
 * Regra: O código deve ser envelopado em tags de formatação adequadas (<pre> e <code>) para legibilidade técnica
 */
export function generateCodeEmail(data: CodeMailData, siteUrl = DEFAULT_SITE_URL): { subject: string; html: string; text: string } {
  const cleanBase = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const codesUrl = `${cleanBase}/codigos`;
  const subject = `🎁 Novo Código de Recompensa: ${data.code} - Last Asylum BR`;

  const bodyHtml = `
    <!-- BADGE DE CÓDIGO PRESENTE -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td align="center" style="background-color: rgba(234, 179, 8, 0.12); border: 1px solid #eab308; border-radius: 20px; padding: 6px 14px; vertical-align: middle; text-align: center;">
          <span style="color: #eab308; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, Helvetica, sans-serif; line-height: 14px; display: inline-block; vertical-align: middle;">
            GIFT CODE EXCLUSIVO
          </span>
        </td>
      </tr>
    </table>

    <!-- TÍTULO -->
    <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.35;">
      Novo Código de Presente Disponível!
    </h1>

    <p style="margin: 0 0 20px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Um novo código de recompensa foi adicionado ao portal. Copie e resgate imediatamente dentro do jogo para coletar seus itens:
    </p>

    <!-- BLOCO DE CÓDIGO TÉCNICO (<pre><code>) COM COPIABILIDADE OTIMIZADA -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center" style="background-color: #05080e; border: 2px dashed #00ff88; border-radius: 12px; padding: 20px 16px; text-align: center;">
          <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif; letter-spacing: 1.5px; display: block; margin-bottom: 8px; font-weight: 700;">
            CÓDIGO DE RESGATE
          </span>
          <div style="font-family: 'Courier New', Consolas, Monaco, monospace; font-size: 26px; font-weight: 800; color: #00ff88; letter-spacing: 4px; user-select: all; -webkit-user-select: all; text-transform: uppercase; line-height: 1.2;">
            ${data.code}
          </div>
          <span style="font-size: 10px; color: #475569; display: block; margin-top: 8px; font-family: Arial, Helvetica, sans-serif;">
            (Toque ou clique para selecionar o código inteiro)
          </span>
        </td>
      </tr>
    </table>

    <!-- RECOMPENSAS -->
    <div style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.5px;">
        📦 Recompensas Inclusas:
      </h3>
      <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        ${data.rewards || "Recursos e itens exclusivos dentro do jogo."}
      </p>
    </div>

    <!-- INSTRUÇÕES DE RESGATE -->
    <div style="margin-bottom: 28px; background-color: #0f1422; border: 1px solid #1e293b; border-radius: 10px; padding: 16px 18px;">
      <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
        Como Resgatar no Jogo:
      </h4>
      <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #94a3b8; line-height: 1.7;">
        <li>Abra o <strong>Last Asylum</strong> e toque no seu <strong>Avatar</strong> no canto superior esquerdo.</li>
        <li>Acesse as <strong>Configurações</strong> e clique em <strong>Código de Presente</strong>.</li>
        <li>Cole o código <strong style="color: #00ff88; font-family: monospace;">${data.code}</strong> e confirme para receber os itens no correio.</li>
      </ol>
    </div>

    <!-- BOTÃO BULLETPROOF VER TODOS OS CÓDIGOS -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td align="center" bgcolor="#00ff88" style="background-color: #00ff88; border-radius: 10px; text-align: center; vertical-align: middle; padding: 0;">
          <a href="${codesUrl}" target="_blank" rel="noopener noreferrer" class="mobile-btn" style="background-color: #00ff88; border: 1px solid #00ff88; border-radius: 10px; color: #080c14 !important; display: block; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; padding: 14px 32px; text-decoration: none !important; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; line-height: 16px; -webkit-text-size-adjust: none;">
            <span style="color: #080c14 !important; text-decoration: none !important; font-weight: 800; font-size: 14px; line-height: 16px;">Ver Lista Completa de Códigos &rarr;</span>
          </a>
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseLayout({
    title: subject,
    preheader: `Novo código disponível: ${data.code} - Resgate suas recompensas!`,
    bodyHtml,
    siteUrl,
  });

  const text = `Novo Código de Recompensa: ${data.code}\n\nRecompensas: ${data.rewards}\n\nResgate no jogo ou confira em: ${codesUrl}`;

  return { subject, html, text };
}
