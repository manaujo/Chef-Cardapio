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
    id: 'prod_T17YJNH4cGgrlH',
    priceId: 'price_1S55J4B4if3rE1yXQHYm0Hqj',
    name: 'Chef Cardápio Pro Anual',
    description: 'Cardápio digital ilimitado • QR Code personalizado • Pedidos via WhatsApp • Upload de fotos dos produtos • Personalização de cores • Categorias ilimitadas • Produtos ilimitados • Suporte técnico prioritário • Atualizações automáticas • Analytics de visualizações',
    mode: 'subscription',
    price: 499.99,
    currency: 'BRL',
    interval: 'year'
  },
  {
    id: 'prod_T16sudzR836Om2',
    priceId: 'price_1S54eXB4if3rE1yXgB2DaJ1X',
    name: 'Plano Chef Cardápio Pro',
    description: 'Cardápio digital ilimitado • QR Code personalizado • Pedidos via WhatsApp • Upload de fotos dos produtos • Personalização de cores • Categorias ilimitadas • Produtos ilimitados • Suporte técnico prioritário • Atualizações automáticas • Analytics de visualizações',
    mode: 'subscription',
    price: 49.99,
    currency: 'BRL',
    interval: 'month'
  },
  {
    id: 'prod_SytnLTTRUGsctD',
    priceId: 'price_1S2w0KB4if3rE1yX3gGCzDaQ',
    name: 'Teste',
    description: 'teste',
    mode: 'subscription',
    price: 1.00,
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