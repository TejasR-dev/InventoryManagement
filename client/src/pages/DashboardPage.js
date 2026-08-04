import React, { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../services/api';
import { getOrders } from '../services/api';
import './DashboardPage.css'; // New CSS file for styling

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products and orders in parallel
        const [productsResponse, ordersResponse] = await Promise.all([
          getProducts(),
          getOrders()
        ]);
        setProducts(productsResponse.data);
        setOrders(ordersResponse.data);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate summary metrics using useMemo for optimization
  const summaryStats = useMemo(() => {
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    
    return {
      totalProducts,
      totalInventoryValue,
      totalOrders,
      totalSales
    };
  }, [products, orders]);

  // Filter for low stock items
  const lowStockItems = useMemo(() => {
    return products.filter(p => p.quantity < 10).sort((a, b) => a.quantity - b.quantity);
  }, [products]);
  
  // Get the 5 most recent orders
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [orders]);


  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Products</h3>
          <p>{summaryStats.totalProducts}</p>
        </div>
        <div className="card">
          <h3>Inventory Value</h3>
          <p>${summaryStats.totalInventoryValue.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Orders</h3>
          <p>{summaryStats.totalOrders}</p>
        </div>
        <div className="card">
          <h3>Total Sales</h3>
          <p>${summaryStats.totalSales.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Low Stock & Recent Orders Sections */}
      <div className="dashboard-details">
        <div className="details-section">
          <h2>Low Stock Items (Less than 10)</h2>
          <ul>
            {lowStockItems.length > 0 ? lowStockItems.map(item => (
              <li key={item.id}>
                {item.name} <span>({item.quantity} remaining)</span>
              </li>
            )) : <p>No items are low on stock.</p>}
          </ul>
        </div>
        <div className="details-section">
          <h2>Recent Orders</h2>
          <ul>
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <li key={order.id}>
                Order #{order.id} - {order.customerName}
                <span>${Number(order.totalAmount).toFixed(2)}</span>
              </li>
            )) : <p>No recent orders.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;