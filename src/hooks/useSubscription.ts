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
  const [lastCheck, setLastCheck] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      // Poll for subscription updates every 15 seconds for better responsiveness
      const interval = setInterval(fetchSubscription, 15000);
      return () => clearInterval(interval);
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      setLastCheck(Date.now());

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      console.log('Subscription data fetched:', data);

      // Set subscription if it exists, regardless of status
      if (data) {
        setSubscription(data);
      } else {
        setSubscription(null);
      }
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
    if (!subscription) return false;
    
    const activeStatuses = ['active', 'trialing'];
    const hasValidSubscription = subscription.subscription_id && subscription.subscription_status !== 'not_started';
    
    return hasValidSubscription && activeStatuses.includes(subscription.subscription_status);
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
    if (!subscription) return false;
    
    // Debug log detalhado
    const debugInfo = {
      subscription_id: subscription.subscription_id,
      status: subscription.subscription_status,
      period_end: subscription.current_period_end,
      current_time: Math.floor(Date.now() / 1000),
      has_subscription_id: !!(subscription.subscription_id && subscription.subscription_id !== ''),
      period_valid: subscription.current_period_end ? subscription.current_period_end > Math.floor(Date.now() / 1000) : true,
      last_check: lastCheck
    };
    
    console.log('🔍 Subscription Access Check:', debugInfo);
    
    // Verificar se tem subscription_id válido (pagamento foi processado)
    if (!subscription.subscription_id || subscription.subscription_id === '') {
      console.log('❌ No subscription_id - payment not processed yet');
      return false;
    }
    
    // Verificar se status é válido (não é not_started)
    if (subscription.subscription_status === 'not_started') {
      console.log('❌ Status is not_started');
      return false;
    }
    
    // Status ativos que garantem acesso
    const activeStatuses = ['active', 'trialing', 'past_due'];
    const hasActiveStatus = activeStatuses.includes(subscription.subscription_status);
    
    // Verificar se período ainda é válido
    const currentTime = Math.floor(Date.now() / 1000);
    const periodValid = subscription.current_period_end ? 
      subscription.current_period_end > currentTime : true;
    
    const hasAccessResult = hasActiveStatus && periodValid;
    console.log(`${hasAccessResult ? '✅' : '❌'} Access Result:`, {
      hasActiveStatus,
      periodValid,
      finalResult: hasAccessResult
    });
    
    return hasAccessResult;
  };

  const getAccessEndDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end * 1000);
  };

  const forceRefresh = async () => {
    console.log('🔄 Force refreshing subscription data...');
    await fetchSubscription();
    
    // Also try to call the manual check function
    try {
      const { data, error } = await supabase.rpc('force_payment_check', {
        user_uuid: user?.id
      });
      
      if (error) {
        console.error('Force payment check error:', error);
      } else {
        console.log('🔍 Force payment check result:', data);
      }
    } catch (err) {
      console.error('Error calling force_payment_check:', err);
    }
  };

  return {
    subscription,
    loading,
    error,
    lastCheck,
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