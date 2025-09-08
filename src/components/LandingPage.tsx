import React, { useState } from 'react';
import { 
  ChefHat, 
  Smartphone, 
  QrCode, 
  MessageCircle, 
  Palette, 
  Shield, 
  Clock, 
  Check,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Heart,
  Menu,
  X,
  Mail,
  Phone,
  Instagram
} from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white/95 backdrop-blur-sm shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" variant="dark" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#funcionalidades" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Funcionalidades
              </a>
              <a href="#planos" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Planos
              </a>
              <a href="#contato" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Contato
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={onLogin}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Entrar
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all font-medium shadow-lg"
              >
                Criar Conta
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#funcionalidades" className="text-gray-700 hover:text-orange-600 font-medium">
                  Funcionalidades
                </a>
                <a href="#planos" className="text-gray-700 hover:text-orange-600 font-medium">
                  Planos
                </a>
                <a href="#contato" className="text-gray-700 hover:text-orange-600 font-medium">
                  Contato
                </a>
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={onLogin}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all font-medium"
                  >
                    Criar Conta
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
          }}
        />
        
        {/* Warm Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-orange-800/75 to-yellow-700/70" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="mb-8">
            <Logo size="lg" variant="light" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Chef Cardápio
            <span className="block text-2xl md:text-3xl lg:text-4xl font-normal mt-2 text-orange-200">
              Seu Cardápio Digital Inteligente
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-orange-100 leading-relaxed">
            Transforme seu restaurante com tecnologia moderna. Crie cardápios digitais, 
            receba pedidos pelo WhatsApp e impressione seus clientes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-3 shadow-2xl transform hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={onLogin}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
            >
              Já Tenho Conta
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
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
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o Chef Cardápio?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-lg border border-orange-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Resultados Comprovados</h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-red-600 mb-2">95%</div>
                    <div className="text-sm text-gray-600 font-medium">Satisfação</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">3x</div>
                    <div className="text-sm text-gray-600 font-medium">Mais Pedidos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">24h</div>
                    <div className="text-sm text-gray-600 font-medium">Para Configurar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plano Mensal Simples
            </h2>
            <p className="text-xl text-gray-600">
              Sem complicações, sem surpresas. Cancele quando quiser!
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 text-sm font-bold rounded-bl-2xl">
              MAIS POPULAR
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chef Cardápio Pro</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-red-600">R$ 49,99</span>
                <div className="text-left">
                  <div className="text-lg text-gray-600">/mês</div>
                  <div className="text-sm font-semibold text-green-600">Primeiro mês grátis</div>
                </div>
              </div>
              <p className="text-gray-600">Cancele quando quiser • Sem fidelidade • Suporte incluído</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                'Cardápio digital ilimitado',
                'QR Code personalizado',
                'Pedidos via WhatsApp',
                'Upload de fotos dos produtos',
                'Personalização de cores',
                'Categorias ilimitadas',
                'Produtos ilimitados',
                'Suporte técnico prioritário',
                'Atualizações automáticas',
                'Analytics de visualizações'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              Começar Agora
            </button>

            <div className="text-center mt-4 text-sm text-gray-500">
              🔒 Pagamento 100% seguro • ⚡ Ativação imediata • 🎯 Sem fidelidade
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500">
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
              className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center gap-3 shadow-lg transform hover:scale-105"
            >
              <Heart className="w-6 h-6" />
              Começar Minha Transformação Digital
            </button>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>+1.000 restaurantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Logo size="lg" variant="light" />
              <p className="text-gray-400 mb-6 mt-4 text-lg">
                Transformando restaurantes com tecnologia moderna e acessível. 
                Crie seu cardápio digital e receba pedidos pelo WhatsApp.
              </p>
              <div className="flex gap-4">
                <a href="mailto:chefcomandaoficial@gmail.com" className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://wa.me/5562982760471" className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/chefcomanda" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Contato</h4>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  chefcomandaoficial@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (62) 98276-0471
                </p>
                <p className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  @chefcomanda
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Funcionalidades</h4>
              <div className="space-y-2 text-gray-400">
                <p>• Cardápio Digital</p>
                <p>• QR Code Automático</p>
                <p>• Pedidos WhatsApp</p>
                <p>• Personalização Total</p>
                <p>• Analytics Avançado</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Chef Cardápio. Todos os direitos reservados. Feito com ❤️ para restaurantes brasileiros.</p>
          </div>
        </div>
      </section>
    </div>
  );
}