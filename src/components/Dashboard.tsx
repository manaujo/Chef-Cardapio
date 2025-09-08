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

type ActiveTab = 'home' | 'menu' | 'settings' | 'public' | 'qr' | 'subscription' | 'support';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const { user } = useAuthContext();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome onNavigate={setActiveTab} />;
      case 'menu':
        return <MenuEditor />;
      case 'settings':
        return <RestaurantSettings />;
      case 'public':
        return <PublicMenu />;
      case 'qr':
        return <QRGenerator />;
      case 'subscription':
        return <SubscriptionManagement />;
      case 'support':
        return <Support />;
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