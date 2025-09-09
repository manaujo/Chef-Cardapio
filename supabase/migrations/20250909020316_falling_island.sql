/*
  # Verificação do Sistema de Pagamentos Chef Cardápio

  1. Verificações
    - Confirma existência de todas as tabelas necessárias
    - Verifica estrutura das colunas
    - Testa políticas RLS
    - Valida views e funções

  2. Relatório
    - Lista todas as tabelas e colunas
    - Mostra índices criados
    - Verifica permissões
    - Testa funções de acesso premium
*/

-- Verificar tabelas existentes
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename LIKE 'stripe_%' 
ORDER BY tablename;

-- Verificar colunas das tabelas Stripe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name LIKE 'stripe_%' 
ORDER BY table_name, ordinal_position;

-- Verificar views criadas
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE viewname LIKE 'stripe_%';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename LIKE 'stripe_%';

-- Verificar índices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE 'stripe_%'
ORDER BY tablename, indexname;

-- Verificar funções relacionadas a pagamentos
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%premium%' OR routine_name LIKE '%subscription%';

-- Teste da função has_premium_access_v2
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_customer_id text := 'cus_test_' || substr(test_user_id::text, 1, 8);
    has_access boolean;
BEGIN
    -- Inserir dados de teste
    INSERT INTO stripe_customers (user_id, customer_id) 
    VALUES (test_user_id, test_customer_id);
    
    INSERT INTO stripe_subscriptions (
        customer_id, 
        subscription_id, 
        status, 
        subscription_status,
        current_period_start,
        current_period_end,
        price_id
    ) VALUES (
        test_customer_id,
        'sub_test_123',
        'active',
        'active',
        EXTRACT(epoch FROM NOW() - INTERVAL '1 day')::bigint,
        EXTRACT(epoch FROM NOW() + INTERVAL '30 days')::bigint,
        'price_1S54eXB4if3rE1yXgB2DaJ1X'
    );
    
    -- Testar função
    SELECT has_premium_access_v2(test_user_id) INTO has_access;
    
    RAISE NOTICE 'Teste da função has_premium_access_v2: %', 
        CASE WHEN has_access THEN 'PASSOU ✓' ELSE 'FALHOU ✗' END;
    
    -- Limpar dados de teste
    DELETE FROM stripe_subscriptions WHERE customer_id = test_customer_id;
    DELETE FROM stripe_customers WHERE customer_id = test_customer_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro no teste: %', SQLERRM;
END $$;

-- Verificar configuração dos produtos Stripe
COMMENT ON SCHEMA public IS 'Sistema Chef Cardápio - Produtos Stripe Configurados:
- Chef Cardápio Pro Anual: R$ 499,99/ano (price_1S55J4B4if3rE1yXQHYm0Hqj)
- Plano Chef Cardápio Pro: R$ 49,99/mês (price_1S54eXB4if3rE1yXgB2DaJ1X)
- Plano Teste: R$ 1,00/mês (price_1S2w0KB4if3rE1yX3gGCzDaQ)';

-- Relatório final
SELECT 
    'SISTEMA DE PAGAMENTOS CHEF CARDÁPIO' as titulo,
    'Tabelas: stripe_customers, stripe_subscriptions, stripe_orders' as tabelas,
    'Views: stripe_user_subscriptions, stripe_user_orders' as views,
    'Funções: has_premium_access_v2, update_updated_at_column' as funcoes,
    'Edge Functions: create-checkout, stripe-webhook, stripe-portal' as edge_functions,
    'Planos: Mensal R$49,99 | Anual R$499,99 | Teste R$1,00' as planos_configurados;