export type MailMarketingType = "artigo" | "noticia" | "codigo";

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

export interface MailMarketingPayload {
  type: MailMarketingType;
  data: ArticleMailData | NewsMailData | CodeMailData;
  recipients?: string[];
  siteUrl?: string;
  testOnly?: boolean;
}

export interface SendMailResult {
  success: boolean;
  message: string;
  recipientCount?: number;
  error?: string;
  simulated?: boolean;
}
