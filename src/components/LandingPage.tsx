import React from 'react';
import { 
  ChefHat, 
  Smartphone, 
  QrCode, 
  MessageCircle, 
  Palette, 
  Shield, 
  Clock, 
  Star,
  Check,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Heart
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Smartphone,
      title: 'Cardápio Digital',
      description: 'Crie um cardápio moderno e responsivo que funciona em qualquer dispositivo'
    },
    {
      icon: QrCode,
      title: 'QR Code Automático',
      description: 'Gere QR codes instantaneamente para seus clientes acessarem o cardápio'
    },
    {
      icon: MessageCircle,
      title: 'Pedidos WhatsApp',
      description: 'Receba pedidos diretamente no seu WhatsApp com mensagens automáticas'
    },
    {
      icon: Palette,
      title: 'Personalização Total',
      description: 'Escolha cores, adicione fotos e personalize completamente seu cardápio'
    },
    {
      icon: Shield,
      title: 'Dados Seguros',
      description: 'Seus dados ficam protegidos e cada conta é completamente independente'
    },
    {
      icon: Clock,
      title: 'Atualização Instantânea',
      description: 'Mudanças no cardápio aparecem imediatamente para seus clientes'
    }
  ];

  const benefits = [
    'Elimine cardápios físicos e reduza custos',
    'Atualize preços e produtos em tempo real',
    'Receba pedidos automaticamente no WhatsApp',
    'Impressione clientes com tecnologia moderna',
    'Aumente suas vendas com apresentação profissional',
    'Funciona em qualquer celular ou tablet'
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      business: 'Pizzaria Bella Vista',
      text: 'O Chef Cardápio revolucionou meu restaurante! Agora recebo pedidos direto no WhatsApp e meus clientes adoram a praticidade.',
      rating: 5
    },
    {
      name: 'João Santos',
      business: 'Hamburgueria do João',
      text: 'Fácil de usar e muito profissional. Meu cardápio ficou lindo e moderno. Recomendo para todos os restaurantes!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      business: 'Doceria Sweet Dreams',
      text: 'Perfeito para meu negócio! Posso adicionar fotos dos doces e os clientes fazem pedidos na hora. Simplesmente incrível!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chef Cardápio</h1>
                <p className="text-xs text-gray-500">Cardápio Digital Inteligente</p>
              </div>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-8 shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforme seu Restaurante
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                com Cardápio Digital
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Crie um cardápio digital profissional, receba pedidos pelo WhatsApp e impressione seus clientes 
              com tecnologia moderna. Tudo isso por apenas <strong className="text-red-600">R$ 49,99</strong>!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Pagamento único • Sem mensalidades</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que seu Restaurante Precisa
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma solução completa para modernizar seu negócio e aumentar suas vendas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o Chef Cardápio?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Resultados Comprovados</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">95%</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">3x</div>
                    <div className="text-sm text-gray-600">Mais Pedidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">24h</div>
                    <div className="text-sm text-gray-600">Para Configurar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 1.000 restaurantes já confiam no Chef Cardápio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plano Único e Simples
            </h2>
            <p className="text-xl text-gray-600">
              Sem complicações, sem mensalidades. Pague uma vez e use para sempre!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-red-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-2 text-sm font-bold">
              MAIS POPULAR
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Chef Cardápio Completo</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-red-600">R$ 49,99</span>
                <div className="text-left">
                  <div className="text-sm text-gray-500 line-through">R$ 99,99</div>
                  <div className="text-sm font-semibold text-green-600">50% OFF</div>
                </div>
              </div>
              <p className="text-gray-600">Pagamento único • Sem mensalidades • Acesso vitalício</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Cardápio digital ilimitado',
                'QR Code personalizado',
                'Pedidos via WhatsApp',
                'Upload de fotos dos produtos',
                'Personalização de cores',
                'Categorias ilimitadas',
                'Produtos ilimitados',
                'Suporte técnico incluído',
                'Atualizações automáticas',
                'Sem taxas adicionais'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Começar Agora - R$ 49,99
            </button>

            <div className="text-center mt-4 text-sm text-gray-500">
              🔒 Pagamento 100% seguro • ⚡ Ativação imediata
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Revolucionar seu Restaurante?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a mais de 1.000 restaurantes que já modernizaram seus cardápios
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Heart className="w-5 h-5" />
              Começar Minha Transformação Digital
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>+1.000 restaurantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>4.9/5 estrelas</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Chef Cardápio</h3>
                  <p className="text-sm text-gray-400">Cardápio Digital Inteligente</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Transformando restaurantes com tecnologia moderna e acessível. 
                Crie seu cardápio digital e receba pedidos pelo WhatsApp.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📧 chefcardapiooficial@gmail.com</p>
                <p>📱 (62) 98276-0471</p>
                <p>📸 @Chefcardapio</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Funcionalidades</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Cardápio Digital</p>
                <p>• QR Code Automático</p>
                <p>• Pedidos WhatsApp</p>
                <p>• Personalização Total</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Chef Cardápio. Todos os direitos reservados. Feito com ❤️ para restaurantes brasileiros.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}