import React, { useState } from 'react';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { stripeProducts } from '../stripe-config';
import { useAuthContext } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

export function PricingPlans() {
  const { user } = useAuthContext();
  const { subscription, hasAccess } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      alert('Você precisa estar logado para assinar um plano');
      return;
    }

    setLoadingPlan(priceId);

    try {
      console.log('Iniciando processo de checkout:', { priceId, mode });
      
      // Obter token de sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: window.location.href,
          mode
        }),
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados da resposta:', data);

      if (data.error) {
        console.error('Erro nos dados:', data.error);
        throw new Error(data.error);
      }

      if (data.url) {
        console.log('Redirecionando para checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('Failed to fetch')) {
        alert(`❌ Erro de Conexão\n\nNão foi possível conectar com o servidor de pagamentos.\n\n🔧 Tente novamente em alguns minutos.\n\n💡 Erro técnico: ${errorMessage}`);
      } else if (errorMessage.includes('Payment service not configured')) {
        alert(`⚙️ Serviço de Pagamento\n\nO sistema de pagamentos está sendo configurado.\n\n📋 Tente novamente em alguns minutos.\n\n💡 Erro: ${errorMessage}`);
      } else {
        alert(`❌ Erro no Pagamento\n\n${errorMessage}\n\n🔄 Tente novamente ou entre em contato com o suporte.`);
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (priceId: string) => {
    return subscription?.price_id === priceId && hasAccess();
  };

  return (
    <div className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme seu restaurante com nossa plataforma completa de cardápio digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stripeProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative ${
                product.interval === 'month' 
                  ? 'border-orange-200 transform scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {product.interval === 'month' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    MAIS POPULAR
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {product.interval === 'year' ? (
                    <Crown className="w-8 h-8 text-yellow-600" />
                  ) : (
                    <Zap className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-4xl font-bold text-red-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <div className="text-left">
                    <div className="text-lg text-gray-600">
                      /{product.interval === 'year' ? 'ano' : 'mês'}
                    </div>
                    {product.interval === 'year' && (
                      <div className="text-sm font-semibold text-green-600">
                        Economize 2 meses
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {product.description.split('•').map((feature, index) => {
                  if (!feature.trim()) return null;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature.trim()}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => handleSubscribe(product.priceId, product.mode)}
                disabled={loadingPlan === product.priceId || isCurrentPlan(product.priceId)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  isCurrentPlan(product.priceId)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : product.interval === 'month'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg transform hover:scale-105'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg transform hover:scale-105'
                }`}
              >
                {loadingPlan === product.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : isCurrentPlan(product.priceId) ? (
                  'Plano Atual'
                ) : (
                  'Assinar Agora'
                )}
              </button>

              {product.interval === 'year' && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    💰 Economize R$ 99,88 por ano
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Suporte técnico incluído</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Atualizações automáticas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}