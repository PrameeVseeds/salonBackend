export interface RegisterServiceInput {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
  max_concurrent_appointments: number | null;
}

export interface UpdateServiceInput {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
  max_concurrent_appointments: number | null;
}

