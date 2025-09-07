import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Product, Category, RestaurantConfig } from '../types';

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => boolean;
  logout: () => void;
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
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_RESTAURANT_CONFIG'; payload: RestaurantConfig }
  | { type: 'LOAD_USER_DATA'; payload: AppState };

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
    whatsappOrdersEnabled: true,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_RESTAURANT_CONFIG':
      return { ...state, restaurantConfig: action.payload };
    case 'LOAD_USER_DATA':
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chefCardapio_currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const userData = localStorage.getItem(`chefCardapio_data_${user.id}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        dispatch({
          type: 'LOAD_USER_DATA',
          payload: { ...parsedData, currentUser: user },
        });
      } else {
        dispatch({ type: 'SET_USER', payload: user });
      }
    }
  }, []);

  // Save user data to localStorage
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('chefCardapio_currentUser', JSON.stringify(state.currentUser));
      localStorage.setItem(
        `chefCardapio_data_${state.currentUser.id}`,
        JSON.stringify({
          products: state.products,
          categories: state.categories,
          restaurantConfig: state.restaurantConfig,
        })
      );
    }
  }, [state]);

  const generateUserId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('chefCardapio_users') || '[]');
    const user = users.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      return true;
    }
    return false;
  };

  const register = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('chefCardapio_users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: generateUserId(),
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem('chefCardapio_users', JSON.stringify(users));
    dispatch({ type: 'SET_USER', payload: newUser });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('chefCardapio_currentUser');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_PRODUCTS', payload: [] });
    dispatch({ type: 'SET_CATEGORIES', payload: initialState.categories });
    dispatch({ type: 'SET_RESTAURANT_CONFIG', payload: initialState.restaurantConfig });
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
        login,
        register,
        logout,
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