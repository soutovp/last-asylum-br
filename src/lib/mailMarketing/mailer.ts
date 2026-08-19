import nodemailer from "nodemailer";
import { SendMailResult } from "./types";

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
 * Garantindo que cada usuário receba o e-mail diretamente com seu próprio endereço no campo 'To'
 */
export async function sendMailMarketing({
  subject,
  html,
  text,
  recipients,
  testOnly = false,
}: {
  subject: string;
  html: string;
  text: string;
  recipients: string[];
  testOnly?: boolean;
}): Promise<SendMailResult> {
  const config = getSmtpConfig();

  // Limpa e valida lista de destinatários (remove duplicados e e-mails inválidos)
  const validRecipients = Array.from(
    new Set(
      recipients
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter((e) => e.length > 3 && e.includes("@") && e.includes("."))
    )
  );

  if (validRecipients.length === 0) {
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
      `[Mail Marketing - SIMULAÇÃO] Disparo simulado para ${validRecipients.length} usuário(s): [${validRecipients.join(", ")}]. Assunto: "${subject}"`
    );
    return {
      success: true,
      message: `Simulação concluída para ${validRecipients.length} destinatário(s). (SMTP não ativo ou modo teste).`,
      recipientCount: validRecipients.length,
      simulated: true,
    };
  }

  const transporter = createMailTransporter();
  if (!transporter) {
    return {
      success: false,
      message: "Falha ao inicializar o transportador SMTP.",
      recipientCount: validRecipients.length,
    };
  }

  try {
    let successCount = 0;
    const errors: string[] = [];

    // Envio individual em concorrência controlada (lotes de 5)
    const CHUNK_SIZE = 5;
    for (let i = 0; i < validRecipients.length; i += CHUNK_SIZE) {
      const chunk = validRecipients.slice(i, i + CHUNK_SIZE);
      const results = await Promise.allSettled(
        chunk.map(async (recipient) => {
          await transporter.sendMail({
            from: config.from,
            to: recipient, // Enviado diretamente para a caixa do usuário cadastrado!
            subject,
            html,
            text,
            replyTo: "contato@lastasylumbr.com.br",
            headers: {
              "X-Entity-Ref-ID": `lastasylum-marketing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              "Precedence": "bulk",
            },
          });
          console.log(`[Mail Marketing] ✅ E-mail enviado com sucesso para: ${recipient}`);
        })
      );

      for (let j = 0; j < results.length; j++) {
        const res = results[j];
        if (res.status === "fulfilled") {
          successCount++;
        } else {
          const recipientEmail = chunk[j];
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
      message: `E-mails enviados com sucesso para ${successCount} de ${validRecipients.length} usuário(s).`,
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
