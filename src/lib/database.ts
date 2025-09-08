import { supabase } from './supabase';
import { Restaurant, Category, Product } from '../types/database';

// Restaurant CRUD
export const restaurantService = {
  async getByUserId(userId: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async create(restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurant)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPublic(restaurantId: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }
};

// Category CRUD
export const categoryService = {
  async getByRestaurantId(restaurantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Product CRUD
export const productService = {
  async getByRestaurantId(restaurantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async getByCategoryId(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPublicByRestaurantId(restaurantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }
};

// Public menu service for QR code access
export const publicMenuService = {
  async getFullMenu(restaurantId: string) {
    const [restaurant, categories, products] = await Promise.all([
      restaurantService.getPublic(restaurantId),
      categoryService.getByRestaurantId(restaurantId),
      productService.getPublicByRestaurantId(restaurantId)
    ]);

    return {
      restaurant,
      categories,
      products
    };
  }
};