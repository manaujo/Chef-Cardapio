import React, { useState } from 'react';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { stripeProducts } from '../stripe-config';
import { useAuthContext } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

export function PricingPlans() {
  const { user } = useAuthContext();
  const { subscription, isActive } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) return;

    setLoadingPlan(priceId);

    try {
      console.log('Starting checkout process:', { priceId, mode });
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found. Please log in again.');
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

      console.log('Checkout response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout response data:', data);

      if (data.error) {
        console.error('Checkout data error:', data.error);
        throw new Error(data.error);
      }

      if (data.url) {
        console.log('Redirecting to checkout:', data.url);
        // Tentar abrir em nova aba primeiro, se falhar usar redirecionamento
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Se popup foi bloqueado, redirecionar na mesma aba
          console.log('Popup blocked, redirecting in same tab');
          window.location.href = data.url;
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Mostrar erro mais detalhado para debugging
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Detailed error:', error);
      
      // Verificar tipo de erro e dar feedback específico
      if (errorMessage.includes('Failed to fetch')) {
        alert(`❌ Erro de Conexão

Não foi possível conectar com o servidor de pagamentos.

🔧 Possíveis soluções:
1. Verifique se as variáveis STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET estão configuradas no Supabase
2. Verifique se a edge function 'create-checkout' está deployada
3. Tente novamente em alguns minutos

💡 Erro técnico: ${errorMessage}`);
      } else if (errorMessage.includes('Payment service not configured')) {
        alert(`⚙️ Configuração Necessária

O sistema de pagamentos precisa ser configurado.

📋 Para configurar:
1. Acesse o Stripe Dashboard
2. Copie sua Secret Key (sk_test_...)
3. Configure no Supabase: Settings → Edge Functions → Environment Variables
4. Adicione: STRIPE_SECRET_KEY=sua_chave_aqui

💡 Erro: ${errorMessage}`);
      } else {
        alert(`❌ Erro no Pagamento

${errorMessage}

🔄 Tente novamente ou entre em contato com o suporte.`);
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (priceId: string) => {
    return subscription?.price_id === priceId && isActive();
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