import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { AppState, User, Product, Category, RestaurantConfig } from '../types';

interface AppContextType extends AppState {
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  updateRestaurantConfig: (config: Partial<RestaurantConfig>) => void;
  generateUserId: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_RESTAURANT_CONFIG'; payload: RestaurantConfig }
  | { type: 'LOAD_USER_DATA'; payload: Omit<AppState, 'currentUser'> };

const initialState: AppState = {
  currentUser: null,
  products: [],
  categories: [
    { id: '1', name: 'Pratos Principais', order: 1 },
    { id: '2', name: 'Bebidas', order: 2 },
    { id: '3', name: 'Sobremesas', order: 3 },
  ],
  restaurantConfig: {
    name: 'Meu Restaurante',
    deliveryTime: '30-40 min',
    whatsapp: '',
    workingHours: 'Seg - Dom: 18h às 23h',
    address: '',
    themeColor: '#DC2626',
    themeColor: '#EA580C',
    whatsappOrdersEnabled: true,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_RESTAURANT_CONFIG':
      return { ...state, restaurantConfig: action.payload };
    case 'LOAD_USER_DATA':
      return { ...action.payload, currentUser: state.currentUser };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuthContext();

  // Update current user from auth context
  const currentUser = user ? {
    id: user.id,
    email: user.email || '',
    password: '', // Not needed with Supabase
  } : null;

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`chefCardapio_data_${user.id}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        dispatch({
          type: 'LOAD_USER_DATA',
          payload: parsedData,
        });
      }
    }
  }, [user]);

  // Save user data to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `chefCardapio_data_${currentUser.id}`,
        JSON.stringify({
          products: state.products,
          categories: state.categories,
          restaurantConfig: state.restaurantConfig,
        })
      );
    }
  }, [state, currentUser]);

  const generateUserId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: generateUserId(),
    };
    dispatch({ type: 'SET_PRODUCTS', payload: [...state.products, newProduct] });
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    const updatedProducts = state.products.map(p => 
      p.id === id ? { ...p, ...productUpdate } : p
    );
    dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts });
  };

  const deleteProduct = (id: string) => {
    const filteredProducts = state.products.filter(p => p.id !== id);
    dispatch({ type: 'SET_PRODUCTS', payload: filteredProducts });
  };

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: generateUserId(),
      name,
      order: state.categories.length + 1,
    };
    dispatch({ type: 'SET_CATEGORIES', payload: [...state.categories, newCategory] });
  };

  const updateCategory = (id: string, name: string) => {
    const updatedCategories = state.categories.map(c => 
      c.id === id ? { ...c, name } : c
    );
    dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
  };

  const deleteCategory = (id: string) => {
    // Also delete products in this category
    const filteredProducts = state.products.filter(p => p.categoryId !== id);
    const filteredCategories = state.categories.filter(c => c.id !== id);
    
    dispatch({ type: 'SET_PRODUCTS', payload: filteredProducts });
    dispatch({ type: 'SET_CATEGORIES', payload: filteredCategories });
  };

  const updateRestaurantConfig = (config: Partial<RestaurantConfig>) => {
    dispatch({
      type: 'SET_RESTAURANT_CONFIG',
      payload: { ...state.restaurantConfig, ...config },
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state, 
        currentUser,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateRestaurantConfig,
        generateUserId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};