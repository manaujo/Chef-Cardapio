import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { publicMenuService } from '../lib/database';
import { PublicMenu } from '../types/database';
import { Logo } from './Logo';

interface PublicMenuPageProps {
  restaurantId: string;
}

export function PublicMenuPage({ restaurantId }: PublicMenuPageProps) {
  const [menuData, setMenuData] = useState<PublicMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicMenuService.getFullMenu(restaurantId);
      setMenuData(data);
    } catch (err) {
      console.error('Error loading public menu:', err);
      setError('Erro ao carregar cardápio');
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsAppMessage = (productName: string, productPrice: number) => {
    const message = `Olá! Gostaria de pedir:\n\n🍽️ ${productName}\n💰 R$ ${productPrice.toFixed(2)}\n\nPoderia me ajudar com o pedido?`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = (productName: string, productPrice: number) => {
    if (!menuData?.restaurant?.whatsapp) {
      alert('WhatsApp não configurado!');
      return;
    }
    
    const cleanPhone = menuData.restaurant.whatsapp.replace(/[^\d]/g, '');
    const message = formatWhatsAppMessage(productName, productPrice);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getCategoryProducts = (categoryId: string) => {
    return menuData?.products.filter(p => p.category_id === categoryId && p.is_available) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (error || !menuData?.restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <Logo size="lg" variant="dark" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cardápio não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            O cardápio que você está procurando não existe ou não está disponível no momento.
          </p>
          <div className="text-sm text-gray-500">
            Powered by Chef Cardápio
          </div>
        </div>
      </div>
    );
  }

  const { restaurant, categories, products } = menuData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="w-full bg-white shadow-lg overflow-hidden"
        style={{ 
          '--theme-color': restaurant.theme_color,
          '--theme-color-light': restaurant.theme_color + '20'
        } as React.CSSProperties}
      >
        {/* Header */}
        <div 
          className="text-white p-6 text-center"
          style={{ backgroundColor: restaurant.theme_color }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
          {restaurant.delivery_time && (
            <div className="flex items-center justify-center gap-2 text-white/90">
              <Clock className="w-5 h-5" />
              <span className="text-lg">{restaurant.delivery_time}</span>
            </div>
          )}
        </div>

        {/* Working Hours */}
        {restaurant.working_hours && (
          <div className="bg-gray-50 p-4 text-center border-b">
            <p className="text-gray-700 font-medium text-lg">{restaurant.working_hours}</p>
          </div>
        )}

        {/* Categories and Products */}
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          {categories
            .filter(category => getCategoryProducts(category.id).length > 0)
            .map((category) => (
              <div key={category.id} className="mb-10 last:mb-6">
                <h2 
                  className="text-2xl font-bold mb-6 pb-3 border-b-2"
                  style={{ 
                    color: restaurant.theme_color,
                    borderColor: restaurant.theme_color 
                  }}
                >
                  {category.name}
                </h2>
                
                <div className="space-y-4">
                  {getCategoryProducts(category.id).map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        {product.image_url && (
                          <div className="md:w-40 h-40 md:h-32 flex-shrink-0">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-xl text-gray-900">{product.name}</h3>
                            <span 
                              className="font-bold text-xl ml-4 flex-shrink-0"
                              style={{ color: restaurant.theme_color }}
                            >
                              R$ {product.price.toFixed(2)}
                            </span>
                          </div>
                          
                          {product.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                          )}
                          
                          {restaurant.whatsapp_orders_enabled && restaurant.whatsapp && (
                            <button
                              onClick={() => handleWhatsAppOrder(product.name, product.price)}
                              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md"
                              style={{ backgroundColor: restaurant.theme_color }}
                            >
                              <MessageCircle className="w-5 h-5" />
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
            <div className="text-center py-16 text-gray-500">
              <div className="mb-4">
                <Logo size="lg" variant="dark" />
              </div>
              <p className="text-xl mb-2">Cardápio em construção</p>
              <p className="text-sm">Em breve teremos deliciosos pratos disponíveis!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {(restaurant.address || restaurant.whatsapp) && (
          <div 
            className="text-white p-6 text-center"
            style={{ backgroundColor: restaurant.theme_color }}
          >
            {restaurant.address && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.whatsapp && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Phone className="w-5 h-5" />
                <span>{restaurant.whatsapp}</span>
              </div>
            )}
            <div className="pt-4 border-t border-white/20 text-white/80 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Logo size="sm" variant="light" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}