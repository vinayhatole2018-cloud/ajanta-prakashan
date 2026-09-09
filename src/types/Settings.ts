export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface SiteSettings {
  websiteName: string;
  description: string;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsappUrl: string | null;
  socialLinks: SocialLinks;
  footerText: string;
  privacyPolicy: string;
  terms: string;
  updatedAt: unknown;
}
