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
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSubscription(data);
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

  const isActive = () => {
    return subscription?.subscription_status === 'active';
  };

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing';
  };

  const isCanceled = () => {
    return subscription?.subscription_status === 'canceled';
  };

  const isPastDue = () => {
    return subscription?.subscription_status === 'past_due';
  };

  const hasAccess = () => {
    // Qualquer plano ativo libera todas as funcionalidades
    return isActive();
  };

  const getAccessEndDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end * 1000);
  };
  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getSubscriptionPlan,
    isActive,
    isTrialing,
    isCanceled,
    isPastDue,
    hasAccess,
    getAccessEndDate
  };
}