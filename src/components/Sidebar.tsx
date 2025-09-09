import React from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Home, 
  UtensilsCrossed, 
  Settings, 
  Eye, 
  QrCode, 
  HelpCircle, 
  LogOut,
  Crown,
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { Logo } from './Logo';

type ActiveTab = 'home' | 'menu' | 'settings' | 'public' | 'qr' | 'subscription' | 'support' | 'profile';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: User | null;
}

export function Sidebar({ activeTab, onTabChange, user }: SidebarProps) {
  const { signOut } = useAuthContext();
  const { getSubscriptionPlan, isActive } = useSubscription();

  const handleLogout = async () => {
    try {
      // Mostrar loading state
      const button = document.querySelector('[data-logout-btn]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Saindo...';
      }
      
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Forçar limpeza completa em caso de erro
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Could not clear storage:', storageError);
      }
      
      // Redirecionar para página inicial
      window.location.href = '/';
    }
  };

  const menuItems = [
    { id: 'home' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'menu' as ActiveTab, label: 'Editor de Cardápio', icon: UtensilsCrossed },
    { id: 'settings' as ActiveTab, label: 'Configurações', icon: Settings },
    { id: 'public' as ActiveTab, label: 'Cardápio Público', icon: Eye },
    { id: 'qr' as ActiveTab, label: 'QR Code', icon: QrCode },
    { id: 'profile' as ActiveTab, label: 'Perfil e Conta', icon: UserIcon },
    { id: 'subscription' as ActiveTab, label: 'Planos e Assinaturas', icon: CreditCard },
    { id: 'support' as ActiveTab, label: 'Suporte', icon: HelpCircle },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-orange-100 shadow-lg z-40">
      <div className="p-6 border-b border-gray-200">
        <Logo size="md" variant="dark" />
        <p className="text-xs text-gray-500 mt-2">{user?.email}</p>
        {user?.user_metadata?.name && (
          <p className="text-xs text-gray-600 font-medium">{user.user_metadata.name}</p>
        )}
        
        {/* Subscription Status */}
        <div className="mt-3">
          {isActive() ? (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              <span className="font-medium">
                {getSubscriptionPlan()?.name.includes('Anual') ? 'Pro Anual' : 'Pro Mensal'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full text-center">
              Plano Gratuito
            </div>
          )}
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
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200 border shadow-sm'
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
          data-logout-btn
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}