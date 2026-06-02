import type { CurrencyCode } from "../helper/currency";

export type CategoryDto = {
  id: number;
  name: string;
}

export type Product = {
  id: string;
  title: string;
  price: number;
  urlSlug: string;
  quantity: number;
  description: string;
  category: CategoryDto | null;
  currencyCode: CurrencyCode;
  createdAt: string; 
  isActive: boolean;
  pictureUrls: string[];
  isBookmarked?: boolean;
}

export type ReqProduct = {
  title: string;
  price: number;
  currencyCode: string;
  description: string;
  quantity: number;
  categoryName: string | null;
  pictureUrls: string[];
  isActive: Boolean;
};

export type UploadPictureDto = {
  s3SignedUrl: string;
  filename: string;
  url: string;
  key: string;
}
