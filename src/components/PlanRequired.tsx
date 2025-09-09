import React from 'react';
import { Crown, Sparkles, ArrowRight, CheckCircle, Zap, Star } from 'lucide-react';
import { PricingPlans } from './PricingPlans';

interface PlanRequiredProps {
  title?: string;
  description?: string;
  feature?: string;
}

export function PlanRequired({ 
  title = "Plano Premium Necessário",
  description = "Esta funcionalidade está disponível apenas para usuários com plano ativo.",
  feature = "esta funcionalidade"
}: PlanRequiredProps) {
  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">{description}</p>
        
        <div className="bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 rounded-2xl p-8 border border-orange-200 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Desbloqueie Todo o Potencial</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: Zap,
                title: 'Acesso Completo',
                description: 'Todas as funcionalidades liberadas'
              },
              {
                icon: Crown,
                title: 'Recursos Premium',
                description: 'QR codes, WhatsApp, personalização'
              },
              {
                icon: CheckCircle,
                title: 'Suporte Prioritário',
                description: 'Atendimento especializado'
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-orange-700 font-medium mb-4">
              ⚡ Para usar {feature}, você precisa de um plano ativo
            </p>
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Escolha seu plano e comece agora mesmo!</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Escolha Seu Plano
        </h2>
        <PricingPlans />
      </div>

      {/* Features Comparison */}
      <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8 flex items-center justify-center gap-3">
          <Star className="w-6 h-6 text-yellow-500" />
          O que você ganha com o plano premium
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg mb-4">✨ Recursos Premium</h4>
            {[
              'Cardápio digital ilimitado',
              'QR Code personalizado',
              'Pedidos via WhatsApp',
              'Upload de fotos dos produtos',
              'Personalização de cores'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg mb-4">🚀 Vantagens Exclusivas</h4>
            {[
              'Categorias ilimitadas',
              'Produtos ilimitados',
              'Suporte técnico prioritário',
              'Atualizações automáticas',
              'Analytics de visualizações'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}