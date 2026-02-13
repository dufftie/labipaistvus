export interface ArticleData {
  title: string;
  url: string;
  paywall: boolean;
  category: string;
  body: string;
  article_id: string;
  id: string;
  media_id: number;
  date_time: string;
  created_at: string;
  authors: string;
  preview_url: string;
}

export interface PartySentiment {
  name: string;
  score: number;
  explanation: string;
}

export interface PoliticianSentiment {
  name: string;
  score: number;
  explanation: string;
}

export interface SentimentData {
  id: number;
  model: string;
  analysed_at: string;
  sentiment: {
    article: {
      id: number,
      title_score: never,
      title_explanation: string;
      body_score: number;
      body_explanation: string;
    };
    parties: PartySentiment[];
    politicians: PoliticianSentiment[];
  };
}

export interface MediaData {
  base_url: string;
  id: string;
  title: string;
  editors: EditorData[];
  description: string;
  slug: string;
  language_code?: string;
  total_count?: number;
  analyzed_count?: number;
  disabled?: boolean;
}

export interface PlaceholderMediaData {
  id: string;
  title: string;
  language_code: string;
  disabled: boolean;
  description?: string;
  editors?: EditorData[];
  base_url?: string;
  slug?: string;
  analyzed_count?: number;
  total_count?: number;
}

export type MediaDataOrPlaceholder = MediaData | PlaceholderMediaData;

export interface EditorData {
  name: string;
  id: number;
}
