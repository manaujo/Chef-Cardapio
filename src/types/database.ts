export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  delivery_time: string;
  whatsapp: string;
  working_hours: string;
  address: string;
  theme_color: string;
  whatsapp_orders_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicMenu {
  restaurant: Restaurant | null;
  categories: Category[];
  products: Product[];
}