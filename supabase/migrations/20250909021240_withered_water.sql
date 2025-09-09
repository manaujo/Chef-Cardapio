/*
  # Correção Final do Sistema de Reconhecimento de Pagamentos

  1. Problemas Identificados
    - Webhook pode não estar processando corretamente
    - Campos de status inconsistentes
    - Lógica de verificação de acesso inadequada

  2. Correções
    - Garantir que todos os campos necessários existam
    - Corrigir view para usar campos corretos
    - Melhorar função de verificação de acesso
    - Adicionar logs de debug

  3. Funcionalidades
    - Reconhecimento automático de pagamentos
    - Verificação manual de status
    - Debug detalhado para desenvolvimento
*/

-- Garantir que o campo subscription_status existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE stripe_subscriptions ADD COLUMN subscription_status stripe_subscription_status DEFAULT 'not_started';
  END IF;
END $$;

-- Sincronizar dados existentes
UPDATE stripe_subscriptions 
SET subscription_status = status 
WHERE subscription_status IS NULL OR subscription_status = 'not_started';

-- Recriar a view com lógica mais robusta
DROP VIEW IF EXISTS stripe_user_subscriptions;
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    COALESCE(s.subscription_status, s.status, 'not_started'::stripe_subscription_status) as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4,
    s.created_at,
    s.updated_at,
    -- Campos de debug
    s.status as raw_status,
    CASE 
        WHEN s.subscription_id IS NOT NULL AND s.subscription_id != '' THEN true
        ELSE false
    END as has_subscription_id,
    CASE 
        WHEN s.current_period_end IS NULL THEN true
        WHEN s.current_period_end > EXTRACT(epoch FROM NOW()) THEN true
        ELSE false
    END as period_valid
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (s.deleted_at IS NULL OR s.id IS NULL);

-- Garantir permissões
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Função melhorada para verificar acesso premium
CREATE OR REPLACE FUNCTION has_premium_access_enhanced(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_record RECORD;
    current_time_unix bigint;
    debug_info text;
BEGIN
    -- Converter timestamp atual para Unix
    current_time_unix := EXTRACT(epoch FROM NOW());
    
    -- Buscar assinatura do usuário com mais detalhes
    SELECT 
        s.subscription_id,
        COALESCE(s.subscription_status, s.status, 'not_started'::stripe_subscription_status) as final_status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        s.price_id,
        c.customer_id
    INTO subscription_record
    FROM stripe_customers c
    LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
    WHERE c.user_id = user_uuid
    AND c.deleted_at IS NULL
    AND (s.deleted_at IS NULL OR s.id IS NULL);
    
    -- Se não encontrou registro, não tem acesso
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Debug info para desenvolvimento
    debug_info := format(
        'User: %s, Customer: %s, Subscription: %s, Status: %s, Period End: %s, Current: %s',
        user_uuid,
        subscription_record.customer_id,
        subscription_record.subscription_id,
        subscription_record.final_status,
        subscription_record.current_period_end,
        current_time_unix
    );
    
    -- Log de debug (apenas em desenvolvimento)
    RAISE NOTICE 'Premium Access Check: %', debug_info;
    
    -- Se não tem subscription_id, não foi processado pelo Stripe ainda
    IF subscription_record.subscription_id IS NULL OR subscription_record.subscription_id = '' THEN
        RETURN false;
    END IF;
    
    -- Verificar status válidos
    IF subscription_record.final_status IN ('active', 'trialing') THEN
        -- Verificar se período ainda é válido
        IF subscription_record.current_period_end IS NULL OR 
           subscription_record.current_period_end > current_time_unix THEN
            RETURN true;
        END IF;
    END IF;
    
    -- Permitir acesso para past_due se ainda dentro do período
    IF subscription_record.final_status = 'past_due' AND 
       subscription_record.current_period_end IS NOT NULL AND
       subscription_record.current_period_end > current_time_unix THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- Trigger para manter campos sincronizados
CREATE OR REPLACE FUNCTION sync_subscription_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar status quando um dos campos for atualizado
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
        NEW.status = NEW.subscription_status;
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.subscription_status = NEW.status;
    END IF;
    
    -- Garantir que updated_at seja atualizado
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS sync_subscription_fields_trigger ON stripe_subscriptions;
CREATE TRIGGER sync_subscription_fields_trigger
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_subscription_fields();

-- Função para forçar verificação de pagamentos (para uso manual)
CREATE OR REPLACE FUNCTION force_payment_check(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    customer_record RECORD;
    subscription_record RECORD;
    result json;
BEGIN
    -- Buscar customer
    SELECT customer_id INTO customer_record
    FROM stripe_customers 
    WHERE user_id = user_uuid AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Customer not found',
            'user_id', user_uuid
        );
    END IF;
    
    -- Buscar subscription
    SELECT * INTO subscription_record
    FROM stripe_subscriptions 
    WHERE customer_id = customer_record.customer_id AND deleted_at IS NULL;
    
    -- Retornar informações detalhadas
    result := json_build_object(
        'success', true,
        'user_id', user_uuid,
        'customer_id', customer_record.customer_id,
        'has_subscription', subscription_record.id IS NOT NULL,
        'subscription_id', subscription_record.subscription_id,
        'status', subscription_record.status,
        'subscription_status', subscription_record.subscription_status,
        'price_id', subscription_record.price_id,
        'current_period_start', subscription_record.current_period_start,
        'current_period_end', subscription_record.current_period_end,
        'has_access', has_premium_access_enhanced(user_uuid),
        'current_timestamp', EXTRACT(epoch FROM NOW())
    );
    
    RETURN result;
END;
$$;

-- Comentários
COMMENT ON FUNCTION has_premium_access_enhanced IS 'Função melhorada para verificar acesso premium com logs detalhados';
COMMENT ON FUNCTION force_payment_check IS 'Função para verificação manual de status de pagamento';
COMMENT ON VIEW stripe_user_subscriptions IS 'View corrigida com campos de debug e lógica robusta';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_lookup 
ON stripe_subscriptions(customer_id, subscription_id) 
WHERE deleted_at IS NULL;

-- Relatório de verificação
SELECT 
    'SISTEMA DE PAGAMENTOS ATUALIZADO' as status,
    COUNT(*) as total_customers
FROM stripe_customers 
WHERE deleted_at IS NULL;