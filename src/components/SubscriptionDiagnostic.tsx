import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Database, User, CreditCard, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export function SubscriptionDiagnostic() {
  const { user } = useAuthContext();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    if (!user) return;

    setLoading(true);
    console.log('🔍 Iniciando diagnóstico completo...');

    try {
      // 1. Verificar se customer existe
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('*')
        .eq('user_id', user.id);

      console.log('👤 Customer Data:', customerData, customerError);

      // 2. Verificar subscription
      let subscriptionData = null;
      let subError = null;
      if (customerData && customerData.length > 0) {
        const { data: subData, error } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('customer_id', customerData[0].customer_id);

        subscriptionData = subData;
        subError = error;
        console.log('💳 Subscription Data:', subscriptionData, subError);
      }

      // 3. Verificar view (filtrando pelo user)
      const { data: viewData, error: viewError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .eq('user_id', user.id);

      console.log('👁️ View Data:', viewData, viewError);

      // 4. Chamar função de verificação manual
      let manualCheckData = null;
      let manualError = null;
      try {
        const { data: manualData, error } = await supabase.rpc('force_payment_check', {
          user_uuid: user.id,
        });
        manualCheckData = manualData;
        manualError = error;
        console.log('🔧 Manual Check:', manualCheckData, manualError);
      } catch (err) {
        console.log('❌ Manual check failed:', err);
      }

      // 5. Verificar todas as tabelas relacionadas
      const { data: allCustomers } = await supabase.from('stripe_customers').select('*');
      const { data: allSubscriptions } = await supabase.from('stripe_subscriptions').select('*');

      setDiagnosticData({
        user_id: user.id,
        user_email: user.email,
        customer_data: customerData,
        subscription_data: subscriptionData,
        view_data: viewData,
        manual_check: manualCheckData,
        all_customers: allCustomers,
        all_subscriptions: allSubscriptions,
        errors: {
          customerError,
          subError,
          viewError,
          manualError,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('❌ Diagnostic error:', error);
      setDiagnosticData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fixSubscriptionData = async () => {
    if (!user || !diagnosticData) return;

    setLoading(true);

    try {
      // Tentar criar customer se não existir
      if (!diagnosticData.customer_data || diagnosticData.customer_data.length === 0) {
        console.log('🔧 Criando customer...');
        const { data: newCustomer, error: customerError } = await supabase
          .from('stripe_customers')
          .insert({
            user_id: user.id,
            customer_id: `cus_manual_${user.id.substring(0, 8)}`,
          })
          .select()
          .single();

        if (customerError) {
          console.error('❌ Erro ao criar customer:', customerError);
        } else {
          console.log('✅ Customer criado:', newCustomer);
        }
      }

      // Reexecutar diagnóstico (limpando dados antigos)
      setDiagnosticData(null);
      await runDiagnostic();
    } catch (error) {
      console.error('❌ Fix error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Diagnóstico de Assinatura</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Diagnosticando...' : 'Executar Diagnóstico'}
          </button>
          {diagnosticData && (
            <button
              onClick={fixSubscriptionData}
              disabled={loading || !diagnosticData}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Tentar Corrigir
            </button>
          )}
        </div>
      </div>

      {diagnosticData && (
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Usuário
            </h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>ID:</strong> {diagnosticData.user_id}
              </p>
              <p>
                <strong>Email:</strong> {diagnosticData.user_email}
              </p>
            </div>
          </div>

          {/* Customer Data */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Dados do Customer
            </h4>
            {diagnosticData.customer_data && diagnosticData.customer_data.length > 0 ? (
              <div className="text-sm space-y-1">
                <p>
                  <strong>Customer ID:</strong> {diagnosticData.customer_data[0].customer_id}
                </p>
                <p>
                  <strong>Criado em:</strong>{' '}
                  {new Date(diagnosticData.customer_data[0].created_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Customer encontrado ✅</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Customer NÃO encontrado ❌</span>
              </div>
            )}
            {diagnosticData.errors?.customerError && (
              <p className="text-red-600 text-sm mt-2">
                Erro: {diagnosticData.errors.customerError.message}
              </p>
            )}
          </div>

          {/* Subscription Data */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Dados da Assinatura
            </h4>
            {diagnosticData.subscription_data && diagnosticData.subscription_data.length > 0 ? (
              <div className="text-sm space-y-1">
                {diagnosticData.subscription_data.map((sub: any, index: number) => (
                  <div key={index} className="border-l-4 border-purple-400 pl-3 mb-3">
                    <p>
                      <strong>Subscription ID:</strong> {sub.subscription_id || '❌ Ausente'}
                    </p>
                    <p>
                      <strong>Status:</strong> {sub.status}
                    </p>
                    <p>
                      <strong>Subscription Status:</strong> {sub.subscription_status}
                    </p>
                    <p>
                      <strong>Price ID:</strong> {sub.price_id}
                    </p>
                    <p>
                      <strong>Período:</strong>{' '}
                      {sub.current_period_start
                        ? new Date(sub.current_period_start * 1000).toLocaleString()
                        : 'N/A'}{' '}
                      até{' '}
                      {sub.current_period_end
                        ? new Date(sub.current_period_end * 1000).toLocaleString()
                        : 'N/A'}
                    </p>
                    <p>
                      <strong>Cartão:</strong> {sub.payment_method_brand} ••••{' '}
                      {sub.payment_method_last4}
                    </p>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Assinatura encontrada ✅</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Assinatura NÃO encontrada ❌</span>
              </div>
            )}
            {diagnosticData.errors?.subError && (
              <p className="text-red-600 text-sm mt-2">
                Erro: {diagnosticData.errors.subError.message}
              </p>
            )}
          </div>

          {/* View Data */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-900 mb-2">Dados da View (stripe_user_subscriptions)</h4>
            {diagnosticData.view_data && diagnosticData.view_data.length > 0 ? (
              <div className="text-sm">
                <pre className="bg-yellow-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(diagnosticData.view_data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>View retornou vazia ❌</span>
              </div>
            )}
            {diagnosticData.errors?.viewError && (
              <p className="text-red-600 text-sm mt-2">
                Erro: {diagnosticData.errors.viewError.message}
              </p>
            )}
          </div>

          {/* Manual Check */}
          {diagnosticData.manual_check && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Verificação Manual</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(diagnosticData.manual_check, null, 2)}
              </pre>
            </div>
          )}
          {diagnosticData.errors?.manualError && (
            <p className="text-red-600 text-sm mt-2">
              Erro na verificação manual: {diagnosticData.errors.manualError.message}
            </p>
          )}

          {/* All Data Summary */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-2">Resumo Geral</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>Total Customers no Sistema:</strong>{' '}
                {diagnosticData.all_customers?.length || 0}
              </p>
              <p>
                <strong>Total Subscriptions no Sistema:</strong>{' '}
                {diagnosticData.all_subscriptions?.length || 0}
              </p>
              <p>
                <strong>Seu Customer:</strong>{' '}
                {diagnosticData.customer_data?.length > 0 ? '✅ Existe' : '❌ Não existe'}
              </p>
              <p>
                <strong>Sua Subscription:</strong>{' '}
                {diagnosticData.subscription_data?.length > 0 ? '✅ Existe' : '❌ Não existe'}
              </p>
              <p>
                <strong>View Funcionando:</strong>{' '}
                {diagnosticData.view_data?.length > 0 ? '✅ Sim' : '❌ Não'}
              </p>
            </div>
          </div>
        </div>
      )}

      {!diagnosticData && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Clique em "Executar Diagnóstico" para analisar sua assinatura</p>
        </div>
      )}
    </div>
  );
}
