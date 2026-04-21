export type CategoryDto = {
  id: number;
  name: string;
}

export type Product = {
  id: number;
  title: string;
  price: number;
  urlSlug: string;
  quantity: number;
  category: CategoryDto | null;
  currencyCode: string;
  createdAt: string; 
  isActive: boolean;
  pictureUrls: string[];
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

export type UploadProductPictureUrl = {
  s3SignedUrl: string;
  filename: string;
  url: string;
  key: string;
}
