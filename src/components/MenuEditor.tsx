import React, { useState } from 'react';
import { Plus, Edit, Trash2, Camera, Save, X, Tag, Eye, EyeOff } from 'lucide-react';
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editor de Cardápio</h1>
          <p className="text-gray-600">Gerencie seus produtos e categorias</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Tag className="w-5 h-5" />
            Nova Categoria
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Categorias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  {products.filter(p => p.category_id === category.id).length} produtos
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editCategory(category)}
                  className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products by Category */}
      {categories.map((category) => {
        const categoryProducts = products.filter(p => p.category_id === category.id);
        
        if (categoryProducts.length === 0) return null;

        return (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <div key={product.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${!product.is_available ? 'opacity-60' : ''}`}>
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <button
                        onClick={() => handleToggleAvailability(product.id, product.is_available)}
                        className={`p-1 rounded ${product.is_available ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                        title={product.is_available ? 'Produto disponível' : 'Produto indisponível'}
                      >
                        {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-red-600 font-bold text-lg mb-2">
                      R$ {product.price.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleProductSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="p-2 text-gray-400 hover:text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Descreva o produto..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto do Produto
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {productForm.image_url ? (
                        <div className="relative">
                          <img
                            src={productForm.image_url}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
          <div className="bg-white rounded-lg w-full max-w-md">
            <form onSubmit={handleCategorySubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="p-2 text-gray-400 hover:text-gray-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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