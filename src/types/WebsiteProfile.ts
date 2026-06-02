export interface WebsiteProfileDto {
  photoProfile: string | null;
  personalDescription: string | null;
  email: string | null;
  whatsappUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  vgenUrl: string | null;
  discordUrl: string | null;
  twitterUrl: string | null;
}

export interface ContactInfoDto {
  email: string | null;
  whatsappUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
}

export interface WebsiteProfileRequestDto extends WebsiteProfileDto {}
