/*
  # Corrigir Reconhecimento de Assinatura

  1. Problemas Identificados
    - Campo `subscription_status` não existe na tabela `stripe_subscriptions`
    - View `stripe_user_subscriptions` usando campo incorreto
    - Lógica de verificação de assinatura inconsistente

  2. Correções
    - Adicionar campo `subscription_status` se não existir
    - Corrigir view para usar campo correto
    - Atualizar políticas RLS
    - Adicionar índices para performance

  3. Funcionalidades
    - Reconhecimento correto de pagamentos
    - Status de assinatura preciso
    - Verificação de acesso premium
*/

-- Adicionar campo subscription_status se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE stripe_subscriptions ADD COLUMN subscription_status stripe_subscription_status DEFAULT 'not_started';
  END IF;
END $$;

-- Atualizar registros existentes para usar o campo status como subscription_status
UPDATE stripe_subscriptions 
SET subscription_status = status 
WHERE subscription_status IS NULL OR subscription_status = 'not_started';

-- Recriar a view stripe_user_subscriptions com campos corretos
DROP VIEW IF EXISTS stripe_user_subscriptions;
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    COALESCE(s.subscription_status, s.status) as subscription_status,
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

-- Garantir permissões na view
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Função melhorada para verificar acesso premium
CREATE OR REPLACE FUNCTION has_premium_access_v2(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_record RECORD;
    current_time_unix bigint;
BEGIN
    -- Converter timestamp atual para Unix
    current_time_unix := EXTRACT(epoch FROM NOW());
    
    -- Buscar assinatura do usuário
    SELECT 
        COALESCE(s.subscription_status, s.status) as status,
        s.subscription_id,
        s.current_period_end,
        s.cancel_at_period_end
    INTO subscription_record
    FROM stripe_customers c
    JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
    WHERE c.user_id = user_uuid
    AND c.deleted_at IS NULL
    AND s.deleted_at IS NULL;
    
    -- Se não encontrou assinatura, não tem acesso premium
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Debug: Log da verificação (apenas em desenvolvimento)
    -- RAISE NOTICE 'Subscription check: status=%, subscription_id=%, period_end=%, current_time=%', 
    --     subscription_record.status, subscription_record.subscription_id, 
    --     subscription_record.current_period_end, current_time_unix;
    
    -- Verificar se tem subscription_id válido (pagamento processado)
    IF subscription_record.subscription_id IS NULL OR subscription_record.subscription_id = '' THEN
        RETURN false;
    END IF;
    
    -- Verificar se a assinatura está ativa
    IF subscription_record.status IN ('active', 'trialing') THEN
        -- Se não tem data de fim ou ainda está dentro do período
        IF subscription_record.current_period_end IS NULL OR 
           subscription_record.current_period_end > current_time_unix THEN
            RETURN true;
        END IF;
    END IF;
    
    -- Verificar se está em período de graça (past_due mas ainda dentro do período)
    IF subscription_record.status = 'past_due' AND 
       subscription_record.current_period_end IS NOT NULL AND
       subscription_record.current_period_end > current_time_unix THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- Trigger para sincronizar status quando subscription_status for atualizado
CREATE OR REPLACE FUNCTION sync_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se subscription_status foi atualizado, sincronizar com status
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
        NEW.status = NEW.subscription_status;
    END IF;
    
    -- Se status foi atualizado, sincronizar com subscription_status
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.subscription_status = NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS sync_subscription_status_trigger ON stripe_subscriptions;
CREATE TRIGGER sync_subscription_status_trigger
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_subscription_status();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_status ON stripe_subscriptions(subscription_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id) WHERE deleted_at IS NULL AND subscription_id IS NOT NULL;

-- Comentários
COMMENT ON FUNCTION has_premium_access_v2 IS 'Versão melhorada para verificar acesso premium com logs de debug';
COMMENT ON VIEW stripe_user_subscriptions IS 'View corrigida para usar campos de status corretos';