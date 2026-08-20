export type MailMarketingType = "artigo" | "noticia" | "codigo" | "promocional";

export interface ArticleMailData {
  title: string;
  summary?: string;
  content: string;
  slug: string;
  imageUrl?: string;
  category?: string;
  authorName?: string;
}

export interface NewsMailData {
  title: string;
  summary?: string;
  content: string;
  slug: string;
  imageUrl?: string;
  category?: string;
  authorName?: string;
}

export interface CodeMailData {
  code: string;
  rewards: string;
  instructions?: string;
  createdAt?: string;
}

export interface PromotionalMailData {
  subject?: string;
  title: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  authorName?: string;
}

export interface RecipientInfo {
  email: string;
  unsubscribeToken?: string;
}

export interface MailMarketingPayload {
  type: MailMarketingType;
  data: ArticleMailData | NewsMailData | CodeMailData | PromotionalMailData;
  recipients?: string[];
  recipientsInfo?: RecipientInfo[];
  siteUrl?: string;
  testOnly?: boolean;
  testRecipient?: string;
}

export interface SendMailResult {
  success: boolean;
  message: string;
  recipientCount?: number;
  error?: string;
  simulated?: boolean;
}
