import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthContext } from '../contexts/AuthContext';
import { Calendar, CreditCard, DollarSign, User, Clock, CheckCircle, XCircle } from 'lucide-react';

export function SubscriptionDebugInfo() {
  const { subscription, loading, getSubscriptionPlan, hasAccess } = useSubscription();
  const { user } = useAuthContext();

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg">Carregando informações...</div>;
  }

  const plan = getSubscriptionPlan();
  const periodStart = subscription?.current_period_start ? new Date(subscription.current_period_start * 1000) : null;
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        Informações Detalhadas da Assinatura
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações do Usuário */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Dados do Usuário</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID do Usuário:</span>
              <span className="font-mono text-xs">{user?.id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nome:</span>
              <span>{user?.user_metadata?.name || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Status da Assinatura */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Status da Assinatura</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tem Acesso:</span>
              <div className="flex items-center gap-1">
                {hasAccess() ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-semibold">SIM</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-semibold">NÃO</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold">{subscription?.subscription_status || 'Sem assinatura'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer ID:</span>
              <span className="font-mono text-xs">{subscription?.customer_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subscription ID:</span>
              <span className="font-mono text-xs">{subscription?.subscription_id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Plano */}
      {plan && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Detalhes do Plano
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 font-semibold mb-1">Plano Atual</div>
              <div className="text-blue-800 font-bold">{plan.name}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 font-semibold mb-1">Valor</div>
              <div className="text-green-800 font-bold">
                R$ {plan.price.toFixed(2)}/{plan.interval === 'year' ? 'ano' : 'mês'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 font-semibold mb-1">Tipo</div>
              <div className="text-purple-800 font-bold">
                {plan.interval === 'year' ? 'Anual' : 'Mensal'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informações de Pagamento */}
      {subscription && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            Informações de Pagamento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cartão */}
            {subscription.payment_method_last4 && (
              <div className="space-y-2">
                <div className="text-gray-600 font-medium">Cartão de Crédito</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-800">
                    {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
                  </div>
                </div>
              </div>
            )}

            {/* Datas */}
            <div className="space-y-2">
              <div className="text-gray-600 font-medium">Períodos</div>
              <div className="space-y-2">
                {periodStart && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Início:</span>
                    <span className="font-semibold">{periodStart.toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {periodEnd && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">
                      {subscription.cancel_at_period_end ? 'Cancela em:' : 'Renova em:'}
                    </span>
                    <span className="font-semibold">{periodEnd.toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dados Técnicos */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <details className="cursor-pointer">
          <summary className="font-semibold text-gray-800 mb-2">Dados Técnicos (Debug)</summary>
          <pre className="bg-gray-100 rounded-lg p-4 text-xs overflow-auto">
            {JSON.stringify({
              subscription,
              plan,
              hasAccess: hasAccess(),
              currentTime: Math.floor(Date.now() / 1000),
              periodEndUnix: subscription?.current_period_end
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}