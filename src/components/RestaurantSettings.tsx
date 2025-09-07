import React, { useState } from 'react';
import { Save, Palette, MessageCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { colorThemes, ColorTheme } from '../types';

export function RestaurantSettings() {
  const { restaurantConfig, updateRestaurantConfig } = useApp();
  
  const [config, setConfig] = useState(restaurantConfig);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurantConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleColorChange = (theme: ColorTheme) => {
    setConfig(prev => ({ ...prev, themeColor: theme.primary }));
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações do Restaurante</h1>
        <p className="text-gray-600">Configure as informações que aparecerão no seu cardápio público</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                value={config.deliveryTime}
                onChange={(e) => setConfig(prev => ({ ...prev, deliveryTime: e.target.value }))}
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
                value={config.workingHours}
                onChange={(e) => setConfig(prev => ({ ...prev, workingHours: e.target.value }))}
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
          </div>

          <div className="mt-6">
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
                checked={config.whatsappOrdersEnabled}
                onChange={(e) => setConfig(prev => ({ ...prev, whatsappOrdersEnabled: e.target.checked }))}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="whatsappOrders" className="text-sm font-medium text-gray-700">
                Habilitar pedidos via WhatsApp
              </label>
            </div>
            
            <div className="ml-7 text-sm text-gray-600">
              {config.whatsappOrdersEnabled ? (
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                type="button"
                onClick={() => handleColorChange(theme)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  config.themeColor === theme.primary
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
  );
}