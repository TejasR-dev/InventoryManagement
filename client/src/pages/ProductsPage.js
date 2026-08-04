import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct } from '../services/api';
import './ProductsPage.css';

const initialFormState = { name: '', sku: '', quantity: '', price: '', description: '' };

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // === REPURPOSE STATE FOR BOTH CREATE & EDIT ===
  const [formData, setFormData] = useState(initialFormState);
  // NEW STATE: Track which product we are editing
  const [editingId, setEditingId] = useState(null); 
  // =============================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (err) { setError('Failed to fetch products.') } 
      finally { setLoading(false) }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // === NEW: HANDLER TO START EDITING ===
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsFormVisible(true);
  };
  // =====================================

  // === NEW: HANDLER FOR THE 'ADD' BUTTON ===
  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormVisible(true);
  };
  // =========================================
  
  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingId(null);
    setFormData(initialFormState);
  }

  // === UPDATED: HANDLESUBMIT NOW DOES BOTH CREATE AND UPDATE ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // We are editing
        const response = await updateProduct(editingId, formData);
        setProducts(products.map(p => p.id === editingId ? response.data : p));
      } else {
        // We are creating
        const response = await createProduct(formData);
        setProducts([...products, response.data]);
      }
      handleCancel(); // Reset form and hide it
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'create'} product.`);
    }
  };
  // ============================================================

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
      } catch (err) { alert('Failed to delete product.') }
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button onClick={isFormVisible ? handleCancel : handleAddNew} className="add-btn">
          {isFormVisible ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="product-form">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" required />
          <input name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU" required />
          <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity" required />
          <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="Price" required />
          <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Description"></textarea>
          <button type="submit">Save Product</button>
        </form>
      )}

      <table className="products-table">
        <thead>
          <tr>
            <th>SKU</th><th>Name</th><th>Quantity</th><th>Price</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.sku}</td><td>{product.name}</td><td>{product.quantity}</td>
              <td>${Number(product.price).toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;