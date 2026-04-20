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
  category: CategoryDto;
  currencyCode: string;
  createdAt: string; 
  isActive: boolean;
  pictureUrls: string[];
}
