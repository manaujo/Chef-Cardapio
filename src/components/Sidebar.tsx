import React from 'react';
import { 
  Home, 
  UtensilsCrossed, 
  Settings, 
  Eye, 
  QrCode, 
  HelpCircle, 
  LogOut,
  ChefHat
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

type ActiveTab = 'home' | 'menu' | 'settings' | 'public' | 'qr' | 'support';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout, currentUser } = useApp();

  const menuItems = [
    { id: 'home' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'menu' as ActiveTab, label: 'Editor de Cardápio', icon: UtensilsCrossed },
    { id: 'settings' as ActiveTab, label: 'Configurações', icon: Settings },
    { id: 'public' as ActiveTab, label: 'Cardápio Público', icon: Eye },
    { id: 'qr' as ActiveTab, label: 'QR Code', icon: QrCode },
    { id: 'support' as ActiveTab, label: 'Suporte', icon: HelpCircle },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-40">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chef Cardápio</h1>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-red-50 text-red-700 border-red-200 border'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}