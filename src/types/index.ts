export interface User {
  id: string;
  email: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface RestaurantConfig {
  name: string;
  deliveryTime: string;
  whatsapp: string;
  workingHours: string;
  address: string;
  themeColor: string;
  whatsappOrdersEnabled: boolean;
}

export interface AppState {
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  restaurantConfig: RestaurantConfig;
}

export type ColorTheme = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
};

export const colorThemes: ColorTheme[] = [
  { name: 'Laranja Quente', primary: '#EA580C', secondary: '#FED7AA', accent: '#C2410C' },
  { name: 'Vermelho Intenso', primary: '#DC2626', secondary: '#FEE2E2', accent: '#991B1B' },
  { name: 'Dourado Elegante', primary: '#D97706', secondary: '#FEF3C7', accent: '#92400E' },
  { name: 'Verde Fresco', primary: '#059669', secondary: '#D1FAE5', accent: '#047857' },
  { name: 'Azul Oceano', primary: '#2563EB', secondary: '#DBEAFE', accent: '#1D4ED8' },
  { name: 'Roxo Elegante', primary: '#7C3AED', secondary: '#EDE9FE', accent: '#5B21B6' },
];