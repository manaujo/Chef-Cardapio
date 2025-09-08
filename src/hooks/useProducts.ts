import { useState, useEffect } from 'react';
import { productService } from '../lib/database';
import { Product } from '../types/database';

export function useProducts(restaurantId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [restaurantId]);

  const loadProducts = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await productService.getByRestaurantId(restaurantId);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newProduct = await productService.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Erro ao criar produto');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setError(null);
      const updatedProduct = await productService.update(id, updates);
      setProducts(prev => prev.map(prod => prod.id === id ? updatedProduct : prod));
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Erro ao atualizar produto');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      await productService.delete(id);
      setProducts(prev => prev.filter(prod => prod.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Erro ao deletar produto');
      throw err;
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    return updateProduct(id, { is_available: isAvailable });
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    refetch: loadProducts
  };
}