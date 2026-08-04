import React, { useState, useEffect } from 'react';
import { getProducts, createOrder } from '../services/api';
import './CreateOrderForm.css';

const CreateOrderForm = ({ onOrderCreated, onClose }) => {
  // State for all available products for the dropdown
  const [allProducts, setAllProducts] = useState([]);
  
  // State for the form fields
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  
  // State for the temporary item being added
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Fetch all products when the component mounts
  useEffect(() => {
    getProducts().then(response => setAllProducts(response.data));
  }, []);

  const handleAddItem = () => {
    const product = allProducts.find(p => p.id === parseInt(selectedProductId));
    if (product && quantity > 0) {
      // Add the new item to our orderItems state
      setOrderItems([...orderItems, { 
        productId: product.id, 
        name: product.name,
        quantity: parseInt(quantity) 
      }]);
      // Reset inputs
      setSelectedProductId('');
      setQuantity(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || orderItems.length === 0) {
      alert('Please provide a customer name and add at least one item.');
      return;
    }
    
    // Format the items for the API
    const apiItems = orderItems.map(({ productId, quantity }) => ({ productId, quantity }));
    
    try {
      const newOrder = await createOrder({ customerName, items: apiItems });
      onOrderCreated(newOrder.data); // Notify parent component
      onClose(); // Close the modal
    } catch (error) {
      alert('Failed to create order. Please check stock levels.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-order-form">
      <h3>Create New Order</h3>
      <input
        type="text"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Customer Name"
        required
      />
      
      <div className="order-item-adder">
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
          <option value="">-- Select a Product --</option>
          {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} (In Stock: {p.quantity})</option>)}
        </select>
        <input 
          type="number" 
          min="1" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button type="button" onClick={handleAddItem}>Add Item</button>
      </div>

      <div className="order-items-list">
        <h4>Order Items</h4>
        <ul>
          {orderItems.map((item, index) => (
            <li key={index}>{item.name} - Quantity: {item.quantity}</li>
          ))}
        </ul>
      </div>

      <button type="submit" className="submit-order-btn">Submit Order</button>
    </form>
  );
};

export default CreateOrderForm;