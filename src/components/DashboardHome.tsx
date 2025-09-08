import React from 'react';
import { 
  UtensilsCrossed, 
  Settings, 
  Eye, 
  QrCode, 
  TrendingUp, 
  Clock,
  Users,
  ChefHat,
  Crown
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SubscriptionStatus } from './SubscriptionStatus';
import { PricingPlans } from './PricingPlans';
import { useSubscription } from '../hooks/useSubscription';

type ActiveTab = 'home' | 'menu' | 'settings' | 'public' | 'qr' | 'support';

interface DashboardHomeProps {
  onNavigate: (tab: ActiveTab) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { products, categories, restaurant } = useApp();
  const { hasAccess } = useSubscription();

  const stats = [
    {
      label: 'Total de Produtos',
      value: products.length,
      icon: UtensilsCrossed,
      color: 'bg-red-50 text-red-700',
    },
    {
      label: 'Categorias',
      value: categories.length,
      icon: ChefHat,
      color: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'Cardápio Público',
      value: restaurant?.name ? 'Ativo' : 'Inativo',
      icon: Eye,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Pedidos WhatsApp',
      value: restaurant?.whatsapp_orders_enabled ? 'Ativo' : 'Inativo',
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
    },
  ];

  const quickActions = [
    {
      title: 'Editor de Cardápio',
      description: 'Adicione e gerencie seus produtos',
      icon: UtensilsCrossed,
      action: () => onNavigate('menu'),
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Configurações',
      description: 'Configure seu restaurante',
      icon: Settings,
      action: () => onNavigate('settings'),
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Ver Cardápio Público',
      description: 'Visualize como seus clientes veem',
      icon: Eye,
      action: () => onNavigate('public'),
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Gerar QR Code',
      description: 'Compartilhe seu cardápio',
      icon: QrCode,
      action: () => onNavigate('qr'),
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo ao Chef Cardápio! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Gerencie seu restaurante digital de forma simples e eficiente
        </p>
      </div>

      {/* Subscription Status */}
      <div className="mb-8">
        <SubscriptionStatus />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Plans for non-active users */}
      {!hasAccess() && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Desbloqueie Todo o Potencial
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Faça upgrade para o plano Pro e tenha acesso a recursos avançados, 
              suporte prioritário e muito mais!
            </p>
          </div>
          <PricingPlans />
        </div>
      )}

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasAccess() ? 'Continue Configurando' : 'Primeiros Passos'}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>Configure as informações do seu restaurante</span>
              </div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-red-500" />
                <span>Adicione seus produtos e categorias</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-red-500" />
                <span>Gere o QR Code e compartilhe com seus clientes</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-4 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors border border-red-200"
            >
              {hasAccess() ? 'Ir para Configurações' : 'Começar Configuração'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}