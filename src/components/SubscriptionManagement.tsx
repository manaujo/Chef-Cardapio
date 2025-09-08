import React, { useState } from 'react';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Trash2,
  Edit,
  Loader2,
  ExternalLink,
  DollarSign,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PricingPlans } from './PricingPlans';

export function SubscriptionManagement() {
  const { 
    subscription, 
    loading, 
    getSubscriptionPlan, 
    isActive, 
    isTrialing, 
    isCanceled, 
    isPastDue,
    refetch 
  } = useSubscription();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleManagePayment = async () => {
    setActionLoading('payment');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: window.location.href
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Erro ao abrir portal de pagamento. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading('cancel');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh subscription data
      await refetch();
      setShowCancelConfirm(false);
      alert('Assinatura cancelada com sucesso. Você continuará tendo acesso até o final do período atual.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Erro ao cancelar assinatura. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh subscription data
      await refetch();
      alert('Assinatura reativada com sucesso!');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Erro ao reativar assinatura. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Carregando informações da assinatura...</p>
          </div>
        </div>
      </div>
    );
  }

  const plan = getSubscriptionPlan();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planos e Assinaturas</h1>
        <p className="text-gray-600">Gerencie sua assinatura e forma de pagamento</p>
      </div>

      {/* Current Subscription Status */}
      {subscription ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {plan?.name || 'Plano Ativo'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {isActive() || isTrialing() ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isPastDue() ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    isActive() || isTrialing() ? 'text-green-600' : 
                    isPastDue() ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {isActive() ? 'Ativo' : 
                     isTrialing() ? 'Período de Teste' :
                     isPastDue() ? 'Pagamento Pendente' :
                     isCanceled() ? 'Cancelado' : subscription.subscription_status}
                  </span>
                </div>
              </div>
            </div>
            
            {plan && (
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  R$ {plan.price.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  /{plan.interval === 'year' ? 'ano' : 'mês'}
                </p>
              </div>
            )}
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {periodEnd && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {subscription.cancel_at_period_end ? 'Cancela em' : 'Renova em'}
                  </span>
                </div>
                <p className="text-gray-700">{periodEnd.toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            
            {subscription.payment_method_last4 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Forma de Pagamento</span>
                </div>
                <p className="text-gray-700">
                  {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
                </p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Status do Pagamento</span>
              </div>
              <p className="text-gray-700">
                {isActive() ? 'Em dia' : 
                 isPastDue() ? 'Pendente' : 
                 'Inativo'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleManagePayment}
              disabled={actionLoading === 'payment'}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'payment' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              Alterar Forma de Pagamento
            </button>

            {isActive() && !subscription.cancel_at_period_end && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <Trash2 className="w-5 h-5" />
                Cancelar Assinatura
              </button>
            )}

            {subscription.cancel_at_period_end && (
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading === 'reactivate'}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'reactivate' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                Reativar Assinatura
              </button>
            )}

            <button
              onClick={refetch}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Atualizar Status
            </button>
          </div>

          {/* Cancellation Warning */}
          {subscription.cancel_at_period_end && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Assinatura será cancelada</p>
                  <p className="text-sm text-yellow-700">
                    Você continuará tendo acesso até {periodEnd?.toLocaleDateString('pt-BR')}. 
                    Após essa data, sua conta voltará ao plano gratuito.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Active Subscription */
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhuma Assinatura Ativa
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Você está usando o plano gratuito. Faça upgrade para acessar recursos premium 
              como cardápio ilimitado, QR codes personalizados e suporte prioritário.
            </p>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recursos Inclusos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Plano Gratuito
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cardápio básico
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                QR Code simples
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Suporte limitado
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-orange-600" />
              Plano Pro
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cardápio digital ilimitado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                QR Code personalizado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Pedidos via WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Upload de fotos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Personalização de cores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Suporte prioritário
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      {!isActive() && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Planos Disponíveis</h3>
          <PricingPlans />
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancelar Assinatura?
              </h3>
              <p className="text-gray-600">
                Você continuará tendo acesso aos recursos premium até {periodEnd?.toLocaleDateString('pt-BR')}. 
                Após essa data, sua conta voltará ao plano gratuito.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirmar Cancelamento'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}