import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useRestaurant } from '../hooks/useRestaurant';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';

interface AppContextType {
  // Restaurant data
  restaurant: any;
  restaurantLoading: boolean;
  restaurantError: string | null;
  updateRestaurant: (updates: any) => Promise<any>;
  
  // Categories data
  categories: any[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  createCategory: (name: string) => Promise<any>;
  updateCategory: (id: string, updates: any) => Promise<any>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Products data
  products: any[];
  productsLoading: boolean;
  productsError: string | null;
  createProduct: (product: any) => Promise<any>;
  updateProduct: (id: string, updates: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailability: (id: string, isAvailable: boolean) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  
  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
    updateRestaurant
  } = useRestaurant();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories(restaurant?.id || null);

  const {
    products,
    loading: productsLoading,
    error: productsError,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability: toggleProductAvailability
  } = useProducts(restaurant?.id || null);

  return (
    <AppContext.Provider
      value={{
        restaurant,
        restaurantLoading,
        restaurantError,
        updateRestaurant,
        categories,
        categoriesLoading,
        categoriesError,
        createCategory,
        updateCategory,
        deleteCategory,
        products,
        productsLoading,
        productsError,
        createProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability
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