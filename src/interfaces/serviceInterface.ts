export interface RegisterServiceInput {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
}

export interface UpdateServiceInput {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
}

