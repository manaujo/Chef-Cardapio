import React from 'react';
import { Mail, MessageCircle, Instagram, Phone, HelpCircle, Heart } from 'lucide-react';

export function Support() {
  const contactOptions = [
    {
      type: 'email',
      label: 'E-mail',
      value: 'chefcardapiooficial@gmail.com',
      icon: Mail,
      action: () => window.open('mailto:chefcardapiooficial@gmail.com', '_blank'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      type: 'whatsapp',
      label: 'WhatsApp',
      value: '(62) 98276-0471',
      icon: MessageCircle,
      action: () => window.open('https://wa.me/5562982760471', '_blank'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      type: 'instagram',
      label: 'Instagram',
      value: '@Chefcardapio',
      icon: Instagram,
      action: () => window.open('https://instagram.com/chefcardapio', '_blank'),
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
  ];

  const faqs = [
    {
      question: 'Como adicionar produtos ao meu cardápio?',
      answer: 'Vá para "Editor de Cardápio" e clique em "Novo Produto". Preencha as informações e adicione uma foto para deixar seu produto mais atrativo.',
    },
    {
      question: 'Posso personalizar as cores do meu cardápio?',
      answer: 'Sim! Em "Configurações", você pode escolher entre várias opções de cores para personalizar o visual do seu cardápio público.',
    },
    {
      question: 'Como funciona a integração com WhatsApp?',
      answer: 'Configure seu número nas configurações e habilite pedidos via WhatsApp. Seus clientes poderão clicar em "Pedir pelo WhatsApp" e o pedido será enviado automaticamente.',
    },
    {
      question: 'O QR Code é atualizado automaticamente?',
      answer: 'Sim! Sempre que você adicionar ou modificar produtos, o cardápio acessível pelo QR Code será atualizado automaticamente.',
    },
    {
      question: 'Posso usar o Chef Cardápio gratuitamente?',
      answer: 'Sim! O Chef Cardápio é gratuito e oferece todas as funcionalidades necessárias para criar e gerenciar seu cardápio digital.',
    },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suporte e Contato</h1>
        <p className="text-gray-600">Estamos aqui para ajudar! Entre em contato conosco</p>
      </div>

      {/* Contact Options */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Canais de Atendimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                onClick={option.action}
                className={`${option.color} text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
              >
                <div className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{option.label}</h3>
                  <p className="text-sm opacity-90">{option.value}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Chef Cardápio */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Sobre o Chef Cardápio</h2>
        </div>
        
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            O <strong>Chef Cardápio</strong> foi desenvolvido para revolucionar a forma como restaurantes 
            apresentam seus cardápios aos clientes. Nossa missão é tornar a experiência gastronômica 
            mais moderna, prática e segura.
          </p>
          
          <p>
            Com funcionalidades como QR codes, integração com WhatsApp, personalização de cores e 
            gerenciamento completo de produtos, oferecemos tudo que você precisa para levar seu 
            restaurante para o mundo digital.
          </p>
          
          <p className="font-medium text-red-700">
            ✨ Transformando restaurantes digitalmente, um cardápio por vez!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Chef Cardápio © 2025 - Feito com ❤️ para restaurantes brasileiros</p>
      </div>
    </div>
  );
}