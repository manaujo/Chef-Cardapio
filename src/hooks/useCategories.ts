import { useState, useEffect } from 'react';
import { categoryService } from '../lib/database';
import { Category } from '../types/database';

export function useCategories(restaurantId: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadCategories();
    } else {
      setCategories([]);
      setLoading(false);
    }
  }, [restaurantId]);

  const loadCategories = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getByRestaurantId(restaurantId);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string) => {
    if (!restaurantId) return;

    try {
      setError(null);
      const newCategory = await categoryService.create({
        restaurant_id: restaurantId,
        name,
        order_index: categories.length
      });
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Erro ao criar categoria');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setError(null);
      const updatedCategory = await categoryService.update(id, updates);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Erro ao atualizar categoria');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await categoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Erro ao deletar categoria');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories
  };
}