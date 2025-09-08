import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Loader2, 
  Menu as MenuIcon,
  X,
  Filter,
  Search,
  Star,
  ChefHat,
  Utensils,
  ShoppingCart,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { publicMenuService } from '../lib/database';
import { PublicMenu } from '../types/database';
import { Logo } from './Logo';

interface PublicMenuPageProps {
  restaurantId: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export function PublicMenuPage({ restaurantId }: PublicMenuPageProps) {
  const [menuData, setMenuData] = useState<PublicMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

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

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatWhatsAppOrder = () => {
    if (cart.length === 0) return '';
    
    let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
    
    cart.forEach(item => {
      message += `🍽️ ${item.quantity}x ${item.name}\n`;
      message += `💰 R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `💵 *Total: R$ ${getCartTotal().toFixed(2)}*\n\n`;
    message += `Poderia me ajudar com o pedido?`;
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    if (!menuData?.restaurant?.whatsapp) {
      alert('WhatsApp não configurado!');
      return;
    }
    
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho primeiro!');
      return;
    }
    
    const cleanPhone = menuData.restaurant.whatsapp.replace(/[^\d]/g, '');
    const message = formatWhatsAppOrder();
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho após enviar pedido
    setCart([]);
    setShowCart(false);
  };

  const getCategoryProducts = (categoryId: string) => {
    if (!menuData) return [];
    let products = menuData.products.filter(p => p.category_id === categoryId && p.is_available);
    
    if (searchTerm) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return products;
  };

  const getAllProducts = () => {
    if (!menuData) return [];
    let products = menuData.products.filter(p => p.is_available);
    
    if (searchTerm) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return products;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
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
      {/* Header with Background */}
      <header className="relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop')`
          }}
        />
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${restaurant.theme_color}CC, ${restaurant.theme_color}99, ${restaurant.theme_color}BB)`
          }}
        />
        
        {/* Navigation */}
        <nav className="relative z-20 bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <Logo size="sm" variant="light" />
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('cardapio')}
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Cardápio
                </button>
                <button
                  onClick={() => scrollToSection('contato')}
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Contato
                </button>
                
                {/* Cart Button */}
                <button
                  onClick={() => setShowCart(true)}
                  className="relative bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors border border-white/30 flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-white/20">
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => scrollToSection('inicio')}
                    className="text-white/90 hover:text-white font-medium text-left"
                  >
                    Início
                  </button>
                  <button
                    onClick={() => scrollToSection('cardapio')}
                    className="text-white/90 hover:text-white font-medium text-left"
                  >
                    Cardápio
                  </button>
                  <button
                    onClick={() => scrollToSection('contato')}
                    className="text-white/90 hover:text-white font-medium text-left"
                  >
                    Contato
                  </button>
                  <button
                    onClick={() => {
                      setShowCart(true);
                      setMobileMenuOpen(false);
                    }}
                    className="relative bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors border border-white/30 flex items-center gap-2 w-fit"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Carrinho ({getCartItemsCount()})
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section id="inicio" className="relative z-10 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Seu cardápio online sempre à mão. Rápido, bonito e prático.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {restaurant.delivery_time && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{restaurant.delivery_time}</span>
                </div>
              )}
              {restaurant.working_hours && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Utensils className="w-5 h-5" />
                  <span className="font-medium">{restaurant.working_hours}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('cardapio')}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl transform hover:scale-105"
            >
              Ver Cardápio
            </button>
          </div>
        </section>
      </header>

      {/* Menu Section */}
      <section id="cardapio" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nosso Cardápio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra sabores únicos preparados com ingredientes frescos e muito carinho
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar pratos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:border-transparent transition-colors"
                  style={{ focusRingColor: restaurant.theme_color }}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === 'all' ? restaurant.theme_color : undefined
                  }}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? restaurant.theme_color : undefined
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(selectedCategory === 'all' ? getAllProducts() : getCategoryProducts(selectedCategory)).map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {product.image_url && (
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span 
                      className="font-bold text-2xl"
                      style={{ color: restaurant.theme_color }}
                    >
                      R$ {product.price.toFixed(2)}
                    </span>
                    
                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 text-white px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md"
                      style={{ backgroundColor: restaurant.theme_color }}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No products message */}
          {(selectedCategory === 'all' ? getAllProducts() : getCategoryProducts(selectedCategory)).length === 0 && (
            <div className="text-center py-16">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum prato encontrado' : 'Nenhum prato disponível'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Tente buscar por outro termo ou categoria'
                  : 'Em breve teremos deliciosos pratos disponíveis!'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Entre em Contato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurant.address && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: restaurant.theme_color }} />
                <h3 className="font-semibold text-gray-900 mb-2">Endereço</h3>
                <p className="text-gray-600">{restaurant.address}</p>
              </div>
            )}
            
            {restaurant.whatsapp && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <Phone className="w-8 h-8 mx-auto mb-4" style={{ color: restaurant.theme_color }} />
                <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
                <p className="text-gray-600">{restaurant.whatsapp}</p>
              </div>
            )}
            
            {restaurant.working_hours && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <Clock className="w-8 h-8 mx-auto mb-4" style={{ color: restaurant.theme_color }} />
                <h3 className="font-semibold text-gray-900 mb-2">Horário</h3>
                <p className="text-gray-600">{restaurant.working_hours}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="text-white py-8"
        style={{ backgroundColor: restaurant.theme_color }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <Logo size="md" variant="light" />
          </div>
          <p className="text-white/80 mb-4">
            © 2025 {restaurant.name}. Todos os direitos reservados.
          </p>
          <div className="text-white/60 text-sm">
            Powered by Chef Cardápio
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Carrinho ({getCartItemsCount()})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Seu carrinho está vazio</p>
                  <p className="text-sm text-gray-400">Adicione produtos para fazer seu pedido</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm" style={{ color: restaurant.theme_color }}>
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity text-white"
                          style={{ backgroundColor: restaurant.theme_color }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold" style={{ color: restaurant.theme_color }}>
                    R$ {getCartTotal().toFixed(2)}
                  </span>
                </div>
                
                {restaurant.whatsapp_orders_enabled && restaurant.whatsapp ? (
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
                    style={{ backgroundColor: restaurant.theme_color }}
                  >
                    <MessageCircle className="w-6 h-6" />
                    Finalizar Pedido no WhatsApp
                  </button>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    Pedidos via WhatsApp não estão disponíveis
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {selectedProduct.image_url && (
                <div className="h-64 overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-gray-600">4.8</span>
                </div>
              </div>
              
              {selectedProduct.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedProduct.description}</p>
              )}
              
              <div className="flex justify-between items-center mb-6">
                <span 
                  className="font-bold text-3xl"
                  style={{ color: restaurant.theme_color }}
                >
                  R$ {selectedProduct.price.toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
                style={{ backgroundColor: restaurant.theme_color }}
              >
                <Plus className="w-6 h-6" />
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {getCartItemsCount() > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 md:hidden text-white p-4 rounded-full shadow-2xl z-40 flex items-center gap-2"
          style={{ backgroundColor: restaurant.theme_color }}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{getCartItemsCount()}</span>
        </button>
      )}
    </div>
  );
}