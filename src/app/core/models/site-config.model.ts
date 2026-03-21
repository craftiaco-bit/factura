export interface SiteConfig {
  name: string;
  description: string;
  language: string;
  currency: string;
  whatsapp: string;
  whatsappMessage: string;
  phone: string;
  address: string;
}

export interface NavLink {
  text: string;
  routerLink: string;
  isExternal?: boolean;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  ctaUrl: string;
}
