/*
  # Redesign do Sistema de Pagamentos Chef Cardápio

  1. Limpeza e Reorganização
    - Garantir que todas as tabelas existam com estrutura correta
    - Corrigir views para funcionar adequadamente
    - Simplificar lógica de verificação de acesso

  2. Funcionalidades
    - Sistema de pagamento simplificado
    - Verificação de acesso baseada em subscription_id e status
    - Lógica clara para determinar acesso premium

  3. Segurança
    - RLS mantido em todas as tabelas
    - Views seguras para acesso do usuário
    - Funções para verificação de acesso
*/

-- Garantir que as tabelas existam com estrutura correta
DO $$
BEGIN
    -- Verificar e criar enum se necessário
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
        CREATE TYPE stripe_subscription_status AS ENUM (
            'not_started',
            'incomplete',
            'incomplete_expired',
            'trialing',
            'active',
            'past_due',
            'canceled',
            'unpaid',
            'paused'
        );
    END IF;
END $$;

-- Garantir que subscription_status existe na tabela
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

-- Recriar view principal com lógica simplificada
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
    s.updated_at
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (s.deleted_at IS NULL OR s.id IS NULL);

-- Garantir permissões
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Função simplificada para verificar acesso premium
CREATE OR REPLACE FUNCTION check_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sub_record RECORD;
    current_time_unix bigint;
BEGIN
    -- Timestamp atual em Unix
    current_time_unix := EXTRACT(epoch FROM NOW());
    
    -- Buscar assinatura do usuário
    SELECT 
        s.subscription_id,
        COALESCE(s.subscription_status, s.status) as final_status,
        s.current_period_end
    INTO sub_record
    FROM stripe_customers c
    LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
    WHERE c.user_id = user_uuid
    AND c.deleted_at IS NULL
    AND (s.deleted_at IS NULL OR s.id IS NULL);
    
    -- Se não encontrou dados, não tem acesso
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Deve ter subscription_id válido (pagamento processado)
    IF sub_record.subscription_id IS NULL OR sub_record.subscription_id = '' THEN
        RETURN false;
    END IF;
    
    -- Status deve ser ativo
    IF sub_record.final_status NOT IN ('active', 'trialing') THEN
        RETURN false;
    END IF;
    
    -- Período deve ser válido (se existir)
    IF sub_record.current_period_end IS NOT NULL AND 
       sub_record.current_period_end <= current_time_unix THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

-- Trigger para manter campos sincronizados
CREATE OR REPLACE FUNCTION sync_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar campos de status
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
        NEW.status = NEW.subscription_status;
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.subscription_status = NEW.status;
    END IF;
    
    -- Atualizar timestamp
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS sync_subscription_status_trigger ON stripe_subscriptions;
CREATE TRIGGER sync_subscription_status_trigger
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_subscription_status();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_access_check 
ON stripe_subscriptions(customer_id, subscription_id, subscription_status) 
WHERE deleted_at IS NULL AND subscription_id IS NOT NULL;

-- Comentários
COMMENT ON FUNCTION check_premium_access IS 'Função simplificada para verificar acesso premium';
COMMENT ON VIEW stripe_user_subscriptions IS 'View principal para dados de assinatura do usuário';

-- Relatório de status
SELECT 
    'SISTEMA DE PAGAMENTOS REDESENHADO' as status,
    'Lógica simplificada e mais confiável' as descricao,
    COUNT(*) as total_customers
FROM stripe_customers 
WHERE deleted_at IS NULL;