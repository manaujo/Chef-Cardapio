import React, { useState } from 'react';
import { Save, Palette, MessageCircle, Eye, Clock, MapPin, Phone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const colorThemes = [
  { name: 'Laranja Quente', primary: '#EA580C', secondary: '#FED7AA', accent: '#C2410C' },
  { name: 'Vermelho Intenso', primary: '#DC2626', secondary: '#FEE2E2', accent: '#991B1B' },
  { name: 'Dourado Elegante', primary: '#D97706', secondary: '#FEF3C7', accent: '#92400E' },
  { name: 'Verde Fresco', primary: '#059669', secondary: '#D1FAE5', accent: '#047857' },
  { name: 'Azul Oceano', primary: '#2563EB', secondary: '#DBEAFE', accent: '#1D4ED8' },
  { name: 'Roxo Elegante', primary: '#7C3AED', secondary: '#EDE9FE', accent: '#5B21B6' },
];

export function RestaurantSettings() {
  const { restaurant, updateRestaurant } = useApp();
  
  const [config, setConfig] = useState(restaurant || {
    name: 'Meu Restaurante',
    delivery_time: '30-40 min',
    whatsapp: '',
    working_hours: 'Seg - Dom: 18h às 23h',
    address: '',
    theme_color: '#EA580C',
    whatsapp_orders_enabled: true
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRestaurant(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Erro ao salvar configurações');
    }
  };

  const handleColorChange = (theme: any) => {
    setConfig(prev => ({ ...prev, theme_color: theme.primary }));
  };

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações do Restaurante</h1>
        <p className="text-gray-600">Configure as informações que aparecerão no seu cardápio público</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Restaurante *
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Pizzaria do Chef"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo de Entrega
                  </label>
                  <input
                    type="text"
                    value={config.delivery_time}
                    onChange={(e) => setConfig(prev => ({ ...prev, delivery_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: 30-40 min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={config.working_hours}
                    onChange={(e) => setConfig(prev => ({ ...prev, working_hours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Seg - Dom: 18h às 23h"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp (para pedidos)
                  </label>
                  <input
                    type="tel"
                    value={config.whatsapp}
                    onChange={(e) => setConfig(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo
                  </label>
                  <textarea
                    value={config.address}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Configuration */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Configurações do WhatsApp</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="whatsappOrders"
                    checked={config.whatsapp_orders_enabled}
                    onChange={(e) => setConfig(prev => ({ ...prev, whatsapp_orders_enabled: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="whatsappOrders" className="text-sm font-medium text-gray-700">
                    Habilitar pedidos via WhatsApp
                  </label>
                </div>
                
                <div className="ml-7 text-sm text-gray-600">
                  {config.whatsapp_orders_enabled ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Clientes poderão fazer pedidos direto pelo WhatsApp</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Cardápio será apenas para visualização (sem botão de pedido)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Colors */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Cor do Cardápio Público</h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Escolha a cor principal que aparecerá no seu cardápio público
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => handleColorChange(theme)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.theme_color === theme.primary
                        ? 'border-gray-800 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{theme.name}</p>
                        <p className="text-xs text-gray-500">{theme.primary}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium"
              >
                <Save className="w-5 h-5" />
                {saved ? 'Configurações Salvas!' : 'Salvar Configurações'}
              </button>
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✅ Configurações salvas com sucesso!
              </div>
            )}
          </form>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Pré-visualização</h2>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
              <div 
                className="w-full bg-white rounded-lg shadow-sm overflow-hidden"
                style={{ 
                  '--theme-color': config.theme_color,
                } as React.CSSProperties}
              >
                {/* Header Preview */}
                <div 
                  className="text-white p-4 text-center"
                  style={{ backgroundColor: config.theme_color }}
                >
                  <h1 className="text-lg font-bold mb-1">{config.name}</h1>
                  {config.delivery_time && (
                    <div className="flex items-center justify-center gap-1 text-white/90 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{config.delivery_time}</span>
                    </div>
                  )}
                </div>

                {/* Working Hours Preview */}
                {config.working_hours && (
                  <div className="bg-gray-50 p-2 text-center">
                    <p className="text-gray-700 text-xs font-medium">{config.working_hours}</p>
                  </div>
                )}

                {/* Sample Product Preview */}
                <div className="p-4">
                  <h3 
                    className="text-sm font-bold mb-2 pb-1 border-b"
                    style={{ 
                      color: config.theme_color,
                      borderColor: config.theme_color 
                    }}
                  >
                    Exemplo de Categoria
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">Produto Exemplo</h4>
                      <span 
                        className="font-bold text-sm"
                        style={{ color: config.theme_color }}
                      >
                        R$ 25,90
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">Descrição do produto...</p>
                    
                    {config.whatsapp_orders_enabled && config.whatsapp && (
                      <button
                        className="text-white text-xs px-3 py-1 rounded font-medium"
                        style={{ backgroundColor: config.theme_color }}
                      >
                        Pedir pelo WhatsApp
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Preview */}
                {(config.address || config.whatsapp) && (
                  <div 
                    className="text-white p-3 text-center text-xs"
                    style={{ backgroundColor: config.theme_color }}
                  >
                    {config.address && (
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{config.address}</span>
                      </div>
                    )}
                    {config.whatsapp && (
                      <div className="flex items-center justify-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{config.whatsapp}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              👆 Assim seus clientes verão o cardápio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}