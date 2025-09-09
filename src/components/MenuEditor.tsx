import React, { useState } from 'react';
import { Plus, Edit, Trash2, Camera, Save, X, Tag, Eye, EyeOff, Search, Filter, Grid, List, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function MenuEditor() {
  const { 
    restaurant,
    categories, 
    products,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
  } = useApp();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    image_url: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
  });

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      category_id: '',
      image_url: '',
    });
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '' });
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductForm(prev => ({ ...prev, image_url: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price || !productForm.category_id) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!restaurant) {
      alert('Erro: dados do restaurante não encontrados');
      return;
    }

    try {
      const productData = {
        restaurant_id: restaurant.id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        description: productForm.description,
        category_id: productForm.category_id,
        image_url: productForm.image_url || '',
        is_available: true
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name) {
      alert('Por favor, informe o nome da categoria');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryForm.name });
      } else {
        await createCategory(categoryForm.name);
      }

      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erro ao salvar categoria');
    }
  };

  const editProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category_id: product.category_id,
      image_url: product.image_url || '',
    });
    setShowProductForm(true);
  };

  const editCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryProducts = products.filter(p => p.category_id === categoryId);
    
    if (categoryProducts.length > 0) {
      if (!confirm(`Esta categoria tem ${categoryProducts.length} produto(s). Deletar a categoria também deletará todos os produtos. Continuar?`)) {
        return;
      }
    } else {
      if (!confirm('Deletar esta categoria?')) {
        return;
      }
    }

    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao deletar categoria');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Deletar este produto?')) return;

    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao deletar produto');
    }
  };

  const handleToggleAvailability = async (productId: string, currentAvailability: boolean) => {
    try {
      await toggleProductAvailability(productId, !currentAvailability);
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Erro ao alterar disponibilidade');
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor de Cardápio</h1>
            <p className="text-gray-600">Gerencie seus produtos e categorias</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg transform hover:scale-105"
          >
            <Tag className="w-5 h-5" />
            Nova Categoria
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-600" />
          Categorias ({categories.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {products.filter(p => p.category_id === category.id).length} produtos
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => editCategory(category)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-red-600" />
          Produtos ({filteredProducts.length})
        </h2>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro produto ao cardápio'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                Adicionar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  !product.is_available ? 'opacity-60' : ''
                } ${viewMode === 'list' ? 'flex' : ''}`}
              >
                {product.image_url && (
                  <div className={`overflow-hidden ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'}`}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                    <button
                      onClick={() => handleToggleAvailability(product.id, product.is_available)}
                      className={`p-1 rounded-full transition-colors ${
                        product.is_available 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={product.is_available ? 'Produto disponível' : 'Produto indisponível'}
                    >
                      {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <p className="text-red-600 font-bold text-xl mb-2">
                    R$ {product.price.toFixed(2)}
                  </p>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleProductSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Ex: Pizza Margherita"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Descreva o produto..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto do Produto
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-red-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {productForm.image_url ? (
                        <div className="relative">
                          <img
                            src={productForm.image_url}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                              <span>Clique para enviar uma foto</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <form onSubmit={handleCategorySubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}