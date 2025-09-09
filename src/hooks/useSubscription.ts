import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { getProductByPriceId } from '../stripe-config';

export interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      // Verificar status a cada 30 segundos
      const interval = setInterval(fetchSubscription, 30000);
      return () => clearInterval(interval);
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }

      // Get the first subscription if any exist
      const subscriptionData = data && data.length > 0 ? data[0] : null;
      console.log('Subscription data:', subscriptionData);
      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Erro ao carregar dados da assinatura');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionPlan = () => {
    if (!subscription?.price_id) return null;
    return getProductByPriceId(subscription.price_id);
  };

  // Check if user has premium access
  const hasAccess = () => {
    if (!subscription) return false;
    
    // Must have valid subscription_id (payment processed)
    if (!subscription.subscription_id) return false;
    
    // Status must be active
    const activeStatuses = ['active', 'trialing'];
    if (!activeStatuses.includes(subscription.subscription_status)) return false;
    
    // Period must be valid
    if (subscription.current_period_end) {
      const now = Math.floor(Date.now() / 1000);
      if (subscription.current_period_end <= now) return false;
    }
    
    return true;
  };

  const isActive = () => {
    return subscription?.subscription_status === 'active' && hasAccess();
  };

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing' && hasAccess();
  };

  const isCanceled = () => {
    return subscription?.subscription_status === 'canceled';
  };

  const isPastDue = () => {
    return subscription?.subscription_status === 'past_due';
  };

  const getAccessEndDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end * 1000);
  };

  const forceRefresh = async () => {
    console.log('🔄 Refreshing subscription data...');
    await fetchSubscription();
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    forceRefresh,
    getSubscriptionPlan,
    isActive,
    isTrialing,
    isCanceled,
    isPastDue,
    hasAccess,
    getAccessEndDate
  };
}