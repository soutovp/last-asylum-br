import nodemailer from "nodemailer";
import { RecipientInfo, SendMailResult } from "./types";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lastasylumbr.com.br";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

/**
 * Obtém as configurações SMTP a partir das variáveis de ambiente
 */
export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST || "smtppro.zoho.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || `"Last Asylum BR" <nao-responda@lastasylumbr.com.br>`;

  if (!user || !pass) {
    return null;
  }

  return { host, port, secure, user, pass, from };
}

/**
 * Cria o transporte nodemailer autenticado com o Zoho Mail
 */
export function createMailTransporter() {
  const config = getSmtpConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
}

/**
 * Envia o e-mail de marketing individualmente para cada destinatário
 * Garantindo que cada usuário receba o e-mail diretamente com seu próprio endereço e seu token exclusivo de Unsubscribe
 */
export async function sendMailMarketing({
  subject,
  html,
  text,
  recipients,
  recipientsInfo,
  siteUrl = DEFAULT_SITE_URL,
  testOnly = false,
}: {
  subject: string;
  html: string;
  text: string;
  recipients?: string[];
  recipientsInfo?: RecipientInfo[];
  siteUrl?: string;
  testOnly?: boolean;
}): Promise<SendMailResult> {
  const config = getSmtpConfig();
  const cleanSiteUrl = (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");

  // Normaliza lista de destinatários com seus tokens
  const targetMap = new Map<string, string>();

  if (recipientsInfo && recipientsInfo.length > 0) {
    recipientsInfo.forEach((item) => {
      const email = item.email.trim().toLowerCase();
      if (email.length > 3 && email.includes("@") && email.includes(".")) {
        targetMap.set(email, item.unsubscribeToken || "");
      }
    });
  }

  if (recipients && recipients.length > 0) {
    recipients.forEach((item) => {
      const email = item.trim().toLowerCase();
      if (email.length > 3 && email.includes("@") && email.includes(".") && !targetMap.has(email)) {
        targetMap.set(email, "");
      }
    });
  }

  const validTargets = Array.from(targetMap.entries()).map(([email, token]) => ({
    email,
    token,
  }));

  if (validTargets.length === 0) {
    console.warn("[Mail Marketing] Nenhum destinatário válido fornecido para envio.");
    return {
      success: false,
      message: "Nenhum destinatário válido encontrado.",
      recipientCount: 0,
    };
  }

  // MODO SIMULAÇÃO / AMBIENTE SEM CREDENCIAIS SMTP CONFIGURADAS
  if (!config || testOnly) {
    console.warn(
      `[Mail Marketing - SIMULAÇÃO] Disparo simulado para ${validTargets.length} usuário(s): [${validTargets.map((t) => t.email).join(", ")}]. Assunto: "${subject}"`
    );
    return {
      success: true,
      message: `Simulação concluída para ${validTargets.length} destinatário(s). (SMTP não ativo ou modo teste).`,
      recipientCount: validTargets.length,
      simulated: true,
    };
  }

  const transporter = createMailTransporter();
  if (!transporter) {
    return {
      success: false,
      message: "Falha ao inicializar o transportador SMTP.",
      recipientCount: validTargets.length,
    };
  }

  try {
    let successCount = 0;
    const errors: string[] = [];

    // Envio individual em concorrência controlada (lotes de 5 para evitar rate limit)
    const CHUNK_SIZE = 5;
    for (let i = 0; i < validTargets.length; i += CHUNK_SIZE) {
      const chunk = validTargets.slice(i, i + CHUNK_SIZE);
      const results = await Promise.allSettled(
        chunk.map(async (target) => {
          const userUnsubscribeUrl = target.token
            ? `${cleanSiteUrl}/unsubscribe/${target.token}`
            : `${cleanSiteUrl}/perfil`;

          // Substitui dinamicamente as tags de unsubscribe para este usuário
          const personalizedHtml = html
            .replace(/\{\{UNSUBSCRIBE_LINK\}\}/g, userUnsubscribeUrl)
            .replace(/\{\{UNSUBSCRIBE_TOKEN\}\}/g, target.token || "");

          const personalizedText = text
            .replace(/\{\{UNSUBSCRIBE_LINK\}\}/g, userUnsubscribeUrl)
            .replace(/\{\{UNSUBSCRIBE_TOKEN\}\}/g, target.token || "");

          await transporter.sendMail({
            from: config.from,
            to: target.email,
            subject,
            html: personalizedHtml,
            text: personalizedText,
            replyTo: "contato@lastasylumbr.com.br",
            headers: {
              "X-Entity-Ref-ID": `lastasylum-marketing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              "Precedence": "bulk",
              "List-Unsubscribe": `<${userUnsubscribeUrl}>`,
            },
          });
          console.log(`[Mail Marketing] ✅ E-mail enviado com sucesso para: ${target.email}`);
        })
      );

      for (let j = 0; j < results.length; j++) {
        const res = results[j];
        if (res.status === "fulfilled") {
          successCount++;
        } else {
          const recipientEmail = chunk[j].email;
          const errorMsg = res.reason instanceof Error ? res.reason.message : String(res.reason);
          console.error(`[Mail Marketing] ❌ Falha no envio para ${recipientEmail}:`, errorMsg);
          errors.push(`${recipientEmail}: ${errorMsg}`);
        }
      }
    }

    if (successCount === 0 && errors.length > 0) {
      return {
        success: false,
        message: `Falha no envio para todos os destinatários: ${errors.join("; ")}`,
        recipientCount: 0,
        error: errors[0],
      };
    }

    return {
      success: true,
      message: `E-mails enviados com sucesso para ${successCount} de ${validTargets.length} usuário(s).`,
      recipientCount: successCount,
      simulated: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Mail Marketing - ERRO SMTP GERAL]:", errorMsg);
    return {
      success: false,
      message: `Erro ao enviar e-mails via Zoho SMTP: ${errorMsg}`,
      recipientCount: 0,
      error: errorMsg,
    };
  }
}
