export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SH7PnRqOmYrIcY',
    priceId: 'price_1RMZAmB4if3rE1yX5xRa4ZnU',
    name: 'Básico',
    description: 'Acesso completo às comandas e mesas • Gerenciamento para garçons e cozinha • Controle de estoque • Acesso ao dashboard • Relatórios avançados de vendas • Exportação de dados (PDF e Excel) • Suporte padrão • Cancelamento a qualquer momento • Teste grátis de 7 dias',
    mode: 'subscription',
    price: 60.90,
    currency: 'BRL',
    interval: 'month'
  },
  {
    id: 'prod_SH7OklHXQdHNrC',
    priceId: 'price_1RMZ9lB4if3rE1yXpPOjawb5',
    name: 'Starter',
    description: 'Sistema de PDV completo • Controle de estoque • Dashboard e relatórios • Exportação de dados (PDF e Excel) • Relatórios avançados de vendas • Suporte padrão • Cancelamento a qualquer momento • Teste grátis de 7 dias',
    mode: 'subscription',
    price: 40.00,
    currency: 'BRL',
    interval: 'month'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};