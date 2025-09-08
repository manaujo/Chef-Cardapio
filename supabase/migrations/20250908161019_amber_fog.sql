/*
  # Sistema Completo de Pagamentos Chef Cardápio

  1. Tabelas Principais
    - `stripe_customers`: Liga usuários Supabase aos clientes Stripe
    - `stripe_subscriptions`: Gerencia dados de assinatura e cobrança
    - `stripe_orders`: Armazena informações de pedidos e pagamentos

  2. Views Seguras
    - `stripe_user_subscriptions`: View segura para dados de assinatura do usuário
    - `stripe_user_orders`: View segura para histórico de pedidos do usuário

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados visualizarem apenas seus próprios dados
    - Triggers automáticos para timestamps

  4. Funcionalidades
    - Suporte a assinaturas mensais e anuais
    - Controle de acesso baseado em status de assinatura
    - Histórico completo de pagamentos
    - Cancelamento e reativação de assinaturas
*/

-- Enum para status de assinatura
CREATE TYPE IF NOT EXISTS stripe_subscription_status AS ENUM (
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

-- Enum para status de pedidos
CREATE TYPE IF NOT EXISTS stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);

-- Tabela de clientes Stripe
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null unique,
  customer_id text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint primary key generated always as identity,
  customer_id text unique not null,
  subscription_id text default null,
  price_id text default null,
  current_period_start bigint default null,
  current_period_end bigint default null,
  cancel_at_period_end boolean default false,
  payment_method_brand text default null,
  payment_method_last4 text default null,
  status stripe_subscription_status not null default 'not_started',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint primary key generated always as identity,
    checkout_session_id text not null,
    payment_intent_id text not null,
    customer_id text not null,
    amount_subtotal bigint not null,
    amount_total bigint not null,
    currency text not null,
    payment_status text not null,
    status stripe_order_status not null default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone default null
);

-- Habilitar RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para stripe_customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Políticas RLS para stripe_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Políticas RLS para stripe_orders
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id) WHERE deleted_at IS NULL;

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática de timestamps
DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_subscriptions_updated_at ON stripe_subscriptions;
CREATE TRIGGER update_stripe_subscriptions_updated_at
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_orders_updated_at ON stripe_orders;
CREATE TRIGGER update_stripe_orders_updated_at
    BEFORE UPDATE ON stripe_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views seguras para usuários
DROP VIEW IF EXISTS stripe_user_subscriptions;
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (s.deleted_at IS NULL OR s.id IS NULL);

DROP VIEW IF EXISTS stripe_user_orders;
CREATE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (o.deleted_at IS NULL OR o.id IS NULL);

-- Permissões para views
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;

-- Função para verificar se usuário tem acesso premium
CREATE OR REPLACE FUNCTION has_premium_access(user_uuid uuid)
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
    
    -- Buscar assinatura ativa do usuário
    SELECT s.status, s.current_period_end, s.cancel_at_period_end
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
    
    -- Verificar se a assinatura está ativa e dentro do período
    IF subscription_record.status IN ('active', 'trialing') THEN
        -- Se não tem data de fim ou ainda está dentro do período
        IF subscription_record.current_period_end IS NULL OR 
           subscription_record.current_period_end > current_time_unix THEN
            RETURN true;
        END IF;
    END IF;
    
    RETURN false;
END;
$$;

-- Comentários nas tabelas
COMMENT ON TABLE stripe_customers IS 'Liga usuários Supabase aos clientes Stripe';
COMMENT ON TABLE stripe_subscriptions IS 'Gerencia dados de assinatura e cobrança';
COMMENT ON TABLE stripe_orders IS 'Armazena informações de pedidos e pagamentos';
COMMENT ON VIEW stripe_user_subscriptions IS 'View segura para dados de assinatura do usuário';
COMMENT ON VIEW stripe_user_orders IS 'View segura para histórico de pedidos do usuário';
COMMENT ON FUNCTION has_premium_access IS 'Verifica se o usuário tem acesso premium ativo';