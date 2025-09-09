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
  Crown,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSubscription } from '../hooks/useSubscription';

type ActiveTab = 'home' | 'menu' | 'settings' | 'public' | 'qr' | 'support' | 'profile' | 'subscription';

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
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: '+12%',
      changeType: 'positive'
    },
    {
      label: 'Categorias',
      value: categories.length,
      icon: ChefHat,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      change: '+5%',
      changeType: 'positive'
    },
    {
      label: 'Status do Cardápio',
      value: restaurant?.name ? 'Ativo' : 'Inativo',
      icon: Eye,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: 'Online',
      changeType: 'neutral'
    },
    {
      label: 'Pedidos WhatsApp',
      value: restaurant?.whatsapp_orders_enabled ? 'Ativo' : 'Inativo',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: restaurant?.whatsapp ? 'Configurado' : 'Pendente',
      changeType: restaurant?.whatsapp ? 'positive' : 'warning'
    },
  ];

  const quickActions = [
    {
      title: 'Editor de Cardápio',
      description: 'Adicione e gerencie seus produtos',
      icon: UtensilsCrossed,
      action: () => onNavigate('menu'),
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      badge: products.length > 0 ? `${products.length} produtos` : 'Começar'
    },
    {
      title: 'Configurações',
      description: 'Configure seu restaurante',
      icon: Settings,
      action: () => onNavigate('settings'),
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badge: restaurant?.name !== 'Meu Restaurante' ? 'Configurado' : 'Pendente'
    },
    {
      title: 'Ver Cardápio Público',
      description: 'Visualize como seus clientes veem',
      icon: Eye,
      action: () => onNavigate('public'),
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      badge: 'Visualizar'
    },
    {
      title: 'Gerar QR Code',
      description: 'Compartilhe seu cardápio',
      icon: QrCode,
      action: () => onNavigate('qr'),
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      badge: 'Compartilhar'
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo ao Chef Cardápio! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Gerencie seu restaurante digital de forma simples e eficiente
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                  stat.changeType === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Ações Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const isDisabled = !hasAccess() && ['menu', 'settings', 'public', 'qr'].includes(action.action.toString().split("'")[1]);
            
            return (
              <button
                key={index}
                onClick={action.action}
                disabled={isDisabled}
                className={`group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 text-left transform ${
                  isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:-translate-y-2 hover:border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                    {isDisabled ? 'Premium' : action.badge}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  <span>{isDisabled ? 'Requer Plano' : 'Acessar'}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscription Status for Free Users */}
      {!hasAccess() && (
        <div className="bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 rounded-2xl p-8 border border-orange-200 shadow-sm mb-8">
          <div className="text-center">
            <Crown className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Desbloqueie Todas as Funcionalidades</h3>
            <p className="text-gray-700 mb-6">Você está no plano gratuito. Faça upgrade para acessar o Editor de Cardápio, QR Codes personalizados e muito mais!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('subscription')} 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                Ver Planos Premium
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200"
              >
                Verificar Pagamento
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Acabou de fazer um pagamento? Clique em "Verificar Pagamento" para atualizar seu status.
            </p>
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-100 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {hasAccess() ? 'Continue Configurando seu Restaurante' : 'Como Começar'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{hasAccess() ? 'Configure as informações do seu restaurante' : 'Escolha um plano premium'}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Adicione seus produtos e categorias</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Gere o QR Code e compartilhe</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate(hasAccess() ? 'settings' : 'subscription')}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-lg transform hover:scale-105"
            >
              {hasAccess() ? 'Ir para Configurações' : 'Escolher Plano Premium'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Preview (if has access) */}
      {hasAccess() && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Resumo de Atividade</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">24</div>
              <div className="text-sm text-blue-700">Visualizações hoje</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">156</div>
              <div className="text-sm text-green-700">Total esta semana</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
              <div className="text-sm text-purple-700">Taxa de engajamento</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}