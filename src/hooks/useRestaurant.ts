import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { restaurantService } from '../lib/database';
import { Restaurant } from '../types/database';

export function useRestaurant() {
  const { user } = useAuthContext();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRestaurant();
    } else {
      setRestaurant(null);
      setLoading(false);
    }
  }, [user]);

  const loadRestaurant = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      let restaurantData = await restaurantService.getByUserId(user.id);
      
      // If no restaurant exists, create one with default values
      if (!restaurantData) {
        restaurantData = await restaurantService.create({
          user_id: user.id,
          name: 'Meu Restaurante',
          delivery_time: '30-40 min',
          whatsapp: '',
          working_hours: 'Seg - Dom: 18h às 23h',
          address: '',
          theme_color: '#EA580C',
          whatsapp_orders_enabled: true
        });
      }
      
      setRestaurant(restaurantData);
    } catch (err) {
      console.error('Error loading restaurant:', err);
      setError('Erro ao carregar dados do restaurante');
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!restaurant) return;

    try {
      setError(null);
      const updatedRestaurant = await restaurantService.update(restaurant.id, updates);
      setRestaurant(updatedRestaurant);
      return updatedRestaurant;
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError('Erro ao atualizar dados do restaurante');
      throw err;
    }
  };

  return {
    restaurant,
    loading,
    error,
    updateRestaurant,
    refetch: loadRestaurant
  };
}