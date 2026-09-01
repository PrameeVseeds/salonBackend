export interface RegisterServiceInput {
  category_id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
  max_concurrent_appointments: number | null;
}

export interface UpdateServiceInput {
  category_id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
  max_concurrent_appointments: number | null;
}

export interface SaveSubServiceInput {
  name: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
}

