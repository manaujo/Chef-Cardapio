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
  RefreshCw,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PricingPlans } from './PricingPlans';
import { SubscriptionDebugInfo } from './SubscriptionDebugInfo';
import { SubscriptionDiagnostic } from './SubscriptionDiagnostic';

export function SubscriptionManagement() {
  const { 
    subscription, 
    loading, 
    lastCheck,
    getSubscriptionPlan, 
    isActive, 
    isTrialing, 
    isCanceled, 
    isPastDue,
    hasAccess,
    refetch,
    forceRefresh
  } = useSubscription();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered');
      await forceRefresh();
      showMessage('success', 'Status da assinatura atualizado!');
    } catch (error) {
      console.error('Manual refresh error:', error);
      showMessage('error', 'Erro ao atualizar status');
    } finally {
      setRefreshing(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    // You can implement a toast notification system here
    alert(text);
  };

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
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planos e Assinaturas</h1>
            <p className="text-gray-600">Gerencie sua assinatura e forma de pagamento</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleForceRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && subscription && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6 text-xs font-mono">
          <h3 className="font-bold mb-3 text-yellow-800">🔍 Debug Info (Última verificação: {new Date(lastCheck).toLocaleTimeString()})</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Status:</strong> {subscription.subscription_status}</p>
              <p><strong>Subscription ID:</strong> {subscription.subscription_id || '❌ None'}</p>
              <p><strong>Customer ID:</strong> {subscription.customer_id}</p>
              <p><strong>Price ID:</strong> {subscription.price_id || 'None'}</p>
            </div>
            <div>
              <p><strong>Period End:</strong> {subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toLocaleString() : 'None'}</p>
              <p><strong>Has Access:</strong> <span className={hasAccess() ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{hasAccess() ? '✅ YES' : '❌ NO'}</span></p>
              <p><strong>Current Time:</strong> {Math.floor(Date.now() / 1000)}</p>
              <p><strong>Time Valid:</strong> {subscription.current_period_end && subscription.current_period_end > Math.floor(Date.now() / 1000) ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-8">
          <SubscriptionDiagnostic />
          <SubscriptionDebugInfo />
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {plan?.name || 'Plano Ativo'}
                </h2>
                <div className="flex items-center gap-3 mb-2">
                  {isActive() || isTrialing() ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold text-sm">
                        {isActive() ? 'Ativo' : 'Período de Teste'}
                      </span>
                    </div>
                  ) : isPastDue() ? (
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-semibold text-sm">Pagamento Pendente</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full">
                      <XCircle className="w-4 h-4" />
                      <span className="font-semibold text-sm">
                        {isCanceled() ? 'Cancelado' : subscription.subscription_status}
                      </span>
                    </div>
                  )}
                </div>
                {(isActive() || isTrialing()) && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Todas as funcionalidades liberadas</span>
                  </div>
                )}
              </div>
            </div>
            
            {plan && (
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  R$ {plan.price.toFixed(2)}
                </p>
                <p className="text-gray-600 text-lg">
                  /{plan.interval === 'year' ? 'ano' : 'mês'}
                </p>
                {plan.interval === 'year' && (
                  <p className="text-green-600 text-sm font-medium mt-1">
                    💰 Economize R$ 99,88/ano
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {periodEnd && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span className="font-bold text-blue-900">
                    {subscription.cancel_at_period_end ? 'Cancela em' : 'Renova em'}
                  </span>
                </div>
                <p className="text-blue-800 text-lg font-semibold">{periodEnd.toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            
            {subscription.payment_method_last4 && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-green-900">Forma de Pagamento</span>
                </div>
                <p className="text-green-800 text-lg font-semibold">
                  {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
                </p>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
                <span className="font-bold text-purple-900">Status do Pagamento</span>
              </div>
              <p className="text-purple-800 text-lg font-semibold">
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
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
              >
                <Trash2 className="w-5 h-5" />
                Cancelar Assinatura
              </button>
            )}

            {subscription.cancel_at_period_end && (
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading === 'reactivate'}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Atualizar Status
            </button>
          </div>

          {/* Cancellation Warning */}
          {subscription.cancel_at_period_end && (
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-yellow-800 text-lg mb-2">Assinatura será cancelada</p>
                  <p className="text-yellow-700">
                    Você continuará tendo acesso até <strong>{periodEnd?.toLocaleDateString('pt-BR')}</strong>. 
                    Após essa data, sua conta voltará ao plano gratuito.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Active Subscription */
        <div className="bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 rounded-2xl p-8 border border-orange-200 mb-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nenhuma Assinatura Ativa
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto text-lg">
              Você está usando o plano gratuito. Faça upgrade para acessar recursos premium 
              como cardápio ilimitado, QR codes personalizados e suporte prioritário.
            </p>
            
            {/* Debug para usuários sem assinatura */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 text-xs font-mono max-w-2xl mx-auto">
                <h4 className="font-bold mb-2 text-blue-800">🔍 Debug - Sem Assinatura</h4>
                <p><strong>Última verificação:</strong> {new Date(lastCheck).toLocaleTimeString()}</p>
                <p><strong>Dados encontrados:</strong> {subscription ? 'Sim, mas sem acesso' : 'Nenhum dado de assinatura'}</p>
                {subscription && (
                  <>
                    <p><strong>Subscription ID:</strong> {subscription.subscription_id || '❌ Ausente'}</p>
                    <p><strong>Status:</strong> {subscription.subscription_status}</p>
                  </>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <button
                onClick={handleForceRefresh}
                disabled={refreshing}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 mr-4 font-semibold"
              >
                {refreshing ? '🔄 Verificando...' : '🔍 Verificar Pagamento'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                🔄 Recarregar Página
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-orange-600 font-medium">
              <Zap className="w-5 h-5" />
              <span>Desbloqueie todo o potencial do Chef Cardápio</span>
            </div>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-500" />
          Recursos Inclusos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
              <Shield className="w-6 h-6 text-gray-600" />
              Plano Gratuito
            </h4>
            <ul className="space-y-3">
              {[
                { text: 'Cardápio básico', available: true },
                { text: 'QR Code simples', available: true },
                { text: 'Suporte limitado', available: false },
                { text: 'Personalização limitada', available: false },
                { text: 'Analytics básico', available: false }
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {feature.available ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${feature.available ? 'text-gray-700' : 'text-gray-500'}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
              <Crown className="w-6 h-6 text-orange-600" />
              Plano Pro
            </h4>
            <ul className="space-y-3">
              {[
                'Cardápio digital ilimitado',
                'QR Code personalizado',
                'Pedidos via WhatsApp',
                'Upload de fotos dos produtos',
                'Personalização de cores',
                'Categorias ilimitadas',
                'Produtos ilimitados',
                'Suporte técnico prioritário',
                'Atualizações automáticas',
                'Analytics de visualizações'
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      {!isActive() && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Planos Disponíveis
          </h3>
          <PricingPlans />
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Cancelar Assinatura?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Você continuará tendo acesso aos recursos premium até <strong>{periodEnd?.toLocaleDateString('pt-BR')}</strong>. 
                Após essa data, sua conta voltará ao plano gratuito.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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