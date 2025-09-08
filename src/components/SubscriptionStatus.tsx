import React from 'react';
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export function SubscriptionStatus() {
  const { subscription, loading, getSubscriptionPlan, isActive, isTrialing, isCanceled, isPastDue, hasAccess, getAccessEndDate } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Plano Gratuito</p>
            <p className="text-sm text-yellow-700">Faça upgrade para acessar recursos premium</p>
          </div>
        </div>
      </div>
    );
  }

  const plan = getSubscriptionPlan();
  const accessEndDate = getAccessEndDate();

  const getStatusColor = () => {
    if (hasAccess()) return 'text-green-600';
    if (isPastDue()) return 'text-yellow-600';
    if (isCanceled()) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (hasAccess()) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isPastDue()) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    if (isCanceled()) return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertTriangle className="w-5 h-5 text-gray-600" />;
  };

  const getStatusText = () => {
    if (isActive()) return 'Acesso Liberado';
    if (isTrialing()) return 'Período de Teste';
    if (isPastDue()) return 'Pagamento Pendente';
    if (isCanceled()) return 'Cancelado';
    return subscription.subscription_status;
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-orange-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {plan?.name || 'Plano Ativo'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            {hasAccess() && (
              <p className="text-xs text-green-600 mt-1">
                ✨ Todas as funcionalidades liberadas
              </p>
            )}
          </div>
        </div>
        
        {plan && (
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900">
              R$ {plan.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              /{plan.interval === 'year' ? 'ano' : 'mês'}
            </p>
          </div>
        )}
      </div>

      {accessEndDate && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.cancel_at_period_end 
                ? `Acesso até ${accessEndDate.toLocaleDateString('pt-BR')}`
                : `Renova em ${accessEndDate.toLocaleDateString('pt-BR')}`
              }
            </span>
          </div>
          
          {subscription.payment_method_last4 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <CreditCard className="w-4 h-4" />
              <span>
                {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}