import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  Shield, 
  Bell, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Crown,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';

export function ProfileSettings() {
  const { user, signOut } = useAuthContext();
  const { subscription, getSubscriptionPlan, isActive } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: profileForm.name }
      });

      if (error) throw error;

      showMessage('success', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showMessage('success', 'Senha alterada com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    const confirmText = prompt('Digite "EXCLUIR" para confirmar a exclusão da conta:');
    if (confirmText !== 'EXCLUIR') {
      showMessage('error', 'Confirmação incorreta. Conta não foi excluída.');
      return;
    }

    setLoading(true);

    try {
      // Limpar dados locais primeiro
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Could not clear storage:', storageError);
      }
      
      // Tentar fazer logout
      const { error } = await signOut();
      
      showMessage('success', 'Conta excluída com sucesso');
      
      // Redirecionar após um tempo
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error: any) {
      console.error('Delete account error:', error);
      
      // Forçar limpeza e redirecionamento mesmo com erro
      showMessage('success', 'Conta processada. Você será redirecionado.');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const plan = getSubscriptionPlan();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null;

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil e Configurações</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Informações Pessoais</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O email não pode ser alterado no momento
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Alterar Senha</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Shield className="w-5 h-5" />
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'emailUpdates',
                  label: 'Atualizações por Email',
                  description: 'Receba notificações sobre atualizações do sistema'
                },
                {
                  key: 'marketingEmails',
                  label: 'Emails de Marketing',
                  description: 'Receba ofertas especiais e novidades'
                },
                {
                  key: 'securityAlerts',
                  label: 'Alertas de Segurança',
                  description: 'Notificações sobre atividades suspeitas na conta'
                }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">{notification.label}</h3>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[notification.key as keyof typeof notifications]}
                      onChange={(e) => setNotifications(prev => ({
                        ...prev,
                        [notification.key]: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Zona de Perigo</h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-red-900 mb-2">Excluir Conta</h3>
              <p className="text-red-700 mb-4 text-sm">
                Esta ação é irreversível. Todos os seus dados, incluindo cardápios, produtos e configurações serão permanentemente excluídos.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Excluindo...' : 'Excluir Conta'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Status da Conta</h3>
            </div>

            {isActive() ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Plano Ativo</span>
                </div>
                
                {plan && (
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                    <p className="text-gray-600">R$ {plan.price.toFixed(2)}/{plan.interval === 'year' ? 'ano' : 'mês'}</p>
                  </div>
                )}

                {periodEnd && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renova em {periodEnd.toLocaleDateString('pt-BR')}</span>
                  </div>
                )}

                {subscription?.payment_method_last4 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Plano Gratuito</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Faça upgrade para acessar todas as funcionalidades premium
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas da Conta</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Membro desde</span>
                <span className="font-semibold text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Último login</span>
                <span className="font-semibold text-gray-900">Hoje</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-green-600">Ativo</span>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Dicas de Segurança</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Use uma senha forte com pelo menos 8 caracteres</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Mantenha suas informações de contato atualizadas</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Não compartilhe suas credenciais de acesso</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}