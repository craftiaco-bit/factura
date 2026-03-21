export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  images: string[];
  thumbnails: string[];
  specifications?: Record<string, string>;
}

export interface ParsedDescription {
  subtitle: string;
  body: string;
}
