// client/src/pages/OrdersPage.js

import React, { useState, useEffect } from 'react';
import { getOrders,updateOrderStatus } from '../services/api';
import Modal from '../components/Modal';
import CreateOrderForm from '../components/CreateOrderForm';
import './OrdersPage.css';
import './ProductsPage.css'; // Importing for .page-header and .add-btn styles

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // State to manage the visibility of the "Create Order" modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // This function is passed to the form to update the order list after a successful creation
  const handleOrderCreated = () => {
    // Refetch all orders to get the most up-to-date list
    getOrders().then(response => {
      setOrders(response.data);
    });
  };
  
  const handleToggleExpand = (orderId) => {
    // If the clicked order is already expanded, collapse it. Otherwise, expand it.
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // === NEW: HANDLER FOR STATUS CHANGE ===
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      // Update the state to reflect the change immediately
      // --- THIS IS THE FIX ---
      // Instead of replacing the whole object, we find the old one and just update its status.
      // This preserves the 'items' array that was already in our state.
      setOrders(orders.map(o => 
        o.id === orderId 
        ? { ...o, status: updatedOrder.data.status } // Keep the old order (...o) but update its status
        : o
      ));
    } catch (err) {
      alert('Failed to update order status.');
    }
  };
  // ======================================

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders Management</h1>
        {/* This button now opens the modal */}
        <button onClick={() => setIsModalOpen(true)} className="add-btn">
          Create New Order
        </button>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="order-summary-row">
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>${Number(order.totalAmount).toFixed(2)}</td>

                  {/* === REPLACE STATIC TEXT WITH DROPDOWN === */}
                  <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`status-${order.status.toLowerCase()}`}> 
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  </td>
                  {/* ======================================== */}
                  <td>{order.items.length}</td>
                  <td>
                    <button onClick={() => handleToggleExpand(order.id)}>
                      {expandedOrderId === order.id ? 'Collapse' : 'Details'}
                    </button>
                  </td>
                </tr>
                {/* --- Expanded Details Row --- */}
                {expandedOrderId === order.id && (
                  <tr className="order-details-row">
                    <td colSpan="7">
                      <div className="order-details-content">
                        <h4>Order Details:</h4>
                        <ul>
                          {order.items.map((item) => (
                            <li key={item.id}>
                              <strong>{item.Product.name}</strong> (SKU: {item.Product.sku}) - 
                              Quantity: {item.quantity} @ ${Number(item.priceAtPurchase).toFixed(2)} each
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="7">No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Modal for creating a new order. It's only rendered when isModalOpen is true. */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateOrderForm 
          onOrderCreated={handleOrderCreated} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default OrdersPage;