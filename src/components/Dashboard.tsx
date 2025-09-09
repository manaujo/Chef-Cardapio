import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { MenuEditor } from './MenuEditor';
import { RestaurantSettings } from './RestaurantSettings';
import { PublicMenu } from './PublicMenu';
import { QRGenerator } from './QRGenerator';
import { SubscriptionManagement } from './SubscriptionManagement';
import { Support } from './Support';
import { DashboardHome } from './DashboardHome';
import { ProfileSettings } from './ProfileSettings';
import { PlanRequired } from './PlanRequired';
import { useSubscription } from '../hooks/useSubscription';

type ActiveTab = 'home' | 'menu' | 'settings' | 'public' | 'qr' | 'subscription' | 'support' | 'profile';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const { user } = useAuthContext();
  const { hasAccess } = useSubscription();

  // Check if user has access to premium features
  const requiresPlan = (tab: ActiveTab) => {
    const premiumTabs: ActiveTab[] = ['menu', 'settings', 'public', 'qr'];
    return premiumTabs.includes(tab) && !hasAccess();
  };

  const renderContent = () => {
    // Always allow access to home, profile, subscription, and support
    if (['home', 'profile', 'subscription', 'support'].includes(activeTab)) {
      switch (activeTab) {
        case 'home':
          return <DashboardHome onNavigate={setActiveTab} />;
        case 'profile':
          return <ProfileSettings />;
        case 'subscription':
          return <SubscriptionManagement />;
        case 'support':
          return <Support />;
        default:
          return <DashboardHome onNavigate={setActiveTab} />;
      }
    }

    // Check if premium features require a plan
    if (requiresPlan(activeTab)) {
      const featureNames = {
        menu: 'o Editor de Cardápio',
        settings: 'as Configurações do Restaurante',
        public: 'o Cardápio Público',
        qr: 'o Gerador de QR Code'
      };
      
      return (
        <PlanRequired 
          title="Funcionalidade Premium"
          description="Esta funcionalidade está disponível apenas para usuários com plano ativo."
          feature={featureNames[activeTab as keyof typeof featureNames]}
        />
      );
    }

    // Render premium features for users with active plans
    switch (activeTab) {
      case 'menu':
        return <MenuEditor />;
      case 'settings':
        return <RestaurantSettings />;
      case 'public':
        return <PublicMenu />;
      case 'qr':
        return <QRGenerator />;
      default:
        return <DashboardHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />
      <main className="flex-1 ml-64">
        {renderContent()}
      </main>
    </div>
  );
}