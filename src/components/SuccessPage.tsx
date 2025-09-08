import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Logo */}
          <div className="mb-6">
            <Logo size="md" variant="dark" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pagamento Realizado com Sucesso! 🎉
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Parabéns! Sua assinatura foi ativada e você já pode aproveitar todos os recursos premium do Chef Cardápio.
          </p>

          {/* Features Highlight */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Agora você tem acesso a:
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Cardápio digital ilimitado</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>QR Code personalizado</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Pedidos via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Suporte técnico prioritário</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            Ir para o Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Auto Redirect Notice */}
          <p className="text-xs text-gray-500 mt-4">
            Você será redirecionado automaticamente em alguns segundos...
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Obrigado por escolher o Chef Cardápio! 🍽️</p>
        </div>
      </div>
    </div>
  );
}