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

export function SubscriptionManagement() {
  const { 
    subscription, 
    loading, 
    getSubscriptionPlan, 
    hasAccess,
    isActive,
    isTrialing, 
    isCanceled, 
    isPastDue,
    refetch,
    forceRefresh
  } = useSubscription();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Atualizando status da assinatura...');
      await forceRefresh();
      alert('Status da assinatura atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar status');
    } finally {
      setRefreshing(false);
    }
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
      console.error('Erro ao abrir portal:', error);
      alert('Erro ao abrir portal de pagamento. Tente novamente.');
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
  const userHasAccess = hasAccess();

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

      {/* Current Subscription Status */}
      {subscription && userHasAccess ? (
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
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      {isActive() ? 'Ativo' : isTrialing() ? 'Período de Teste' : 'Ativo'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Todas as funcionalidades liberadas</span>
                </div>
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
                {isActive() ? 'Em dia' : isTrialing() ? 'Período de teste' : 'Pendente'}
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
              Gerenciar Pagamento
            </button>

            <button
              onClick={refetch}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Atualizar Status
            </button>
          </div>
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
              Você não possui uma assinatura ativa. Escolha um plano para acessar todos os recursos.
            </p>
            
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
              <span>Escolha seu plano e comece agora</span>
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
                { text: 'Acesso ao dashboard', available: true },
                { text: 'Suporte básico', available: true },
                { text: 'Sistema de PDV', available: false },
                { text: 'Controle de estoque', available: false },
                { text: 'Relatórios avançados', available: false }
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
              Planos Premium
            </h4>
            <ul className="space-y-3">
              {[
                'Sistema de PDV completo',
                'Controle de estoque avançado',
                'Dashboard e relatórios',
                'Exportação de dados (PDF e Excel)',
                'Relatórios avançados de vendas',
                'Gerenciamento de comandas e mesas',
                'Suporte técnico prioritário',
                'Atualizações automáticas',
                'Teste grátis de 7 dias'
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
      {!userHasAccess && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Planos Disponíveis
          </h3>
          <PricingPlans />
        </div>
      )}
    </div>
  );
}