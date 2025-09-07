import React from 'react';
import { Clock, MapPin, Phone, ExternalLink, MessageCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function PublicMenu() {
  const { products, categories, restaurantConfig } = useApp();

  const formatWhatsAppMessage = (productName: string, productPrice: number) => {
    const message = `Olá! Gostaria de pedir:\n\n🍽️ ${productName}\n💰 R$ ${productPrice.toFixed(2)}\n\nPoderia me ajudar com o pedido?`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = (productName: string, productPrice: number) => {
    if (!restaurantConfig.whatsapp) {
      alert('WhatsApp não configurado!');
      return;
    }
    
    const cleanPhone = restaurantConfig.whatsapp.replace(/[^\d]/g, '');
    const message = formatWhatsAppMessage(productName, productPrice);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const menuUrl = `${window.location.origin}/menu/${btoa(restaurantConfig.name)}`;

  const categoryProducts = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cardápio Público</h1>
        <p className="text-gray-600">Visualize como seus clientes veem o cardápio</p>
      </div>

      {/* Public URL */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <ExternalLink className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">URL do seu cardápio público:</p>
            <p className="text-blue-700 text-sm break-all">{menuUrl}</p>
          </div>
        </div>
      </div>

      {/* Menu Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-1">
        <div 
          className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ 
            '--theme-color': restaurantConfig.themeColor,
            '--theme-color-light': restaurantConfig.themeColor + '20'
          } as React.CSSProperties}
        >
          {/* Header */}
          <div 
            className="text-white p-6 text-center"
            style={{ backgroundColor: restaurantConfig.themeColor }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{restaurantConfig.name}</h1>
            {restaurantConfig.deliveryTime && (
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span>{restaurantConfig.deliveryTime}</span>
              </div>
            )}
          </div>

          {/* Working Hours */}
          {restaurantConfig.workingHours && (
            <div className="bg-gray-50 p-4 text-center">
              <p className="text-gray-700 font-medium">{restaurantConfig.workingHours}</p>
            </div>
          )}

          {/* Categories and Products */}
          <div className="p-4 md:p-6">
            {categories
              .filter(category => categoryProducts(category.id).length > 0)
              .map((category) => (
                <div key={category.id} className="mb-8 last:mb-4">
                  <h2 
                    className="text-xl font-bold mb-4 pb-2 border-b-2"
                    style={{ 
                      color: restaurantConfig.themeColor,
                      borderColor: restaurantConfig.themeColor 
                    }}
                  >
                    {category.name}
                  </h2>
                  
                  <div className="space-y-4">
                    {categoryProducts(category.id).map((product) => (
                      <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="md:flex">
                          {product.image && (
                            <div className="md:w-32 h-32 md:h-24 flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              <span 
                                className="font-bold text-lg ml-4 flex-shrink-0"
                                style={{ color: restaurantConfig.themeColor }}
                              >
                                R$ {product.price.toFixed(2)}
                              </span>
                            </div>
                            
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                            )}
                            
                            {restaurantConfig.whatsappOrdersEnabled && restaurantConfig.whatsapp && (
                              <button
                                onClick={() => handleWhatsAppOrder(product.name, product.price)}
                                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: restaurantConfig.themeColor }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                Pedir pelo WhatsApp
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum produto adicionado ainda</p>
                <p className="text-sm">Adicione produtos no Editor de Cardápio para vê-los aqui</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {(restaurantConfig.address || restaurantConfig.whatsapp) && (
            <div 
              className="text-white p-4 text-center text-sm"
              style={{ backgroundColor: restaurantConfig.themeColor }}
            >
              {restaurantConfig.address && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurantConfig.address}</span>
                </div>
              )}
              {restaurantConfig.whatsapp && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{restaurantConfig.whatsapp}</span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-white/20 text-white/80 text-xs">
                Powered by Chef Cardápio
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600 text-center">
        👆 Esta é a visualização de como seus clientes verão o cardápio
      </div>
    </div>
  );
}