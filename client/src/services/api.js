import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('/users/login', credentials);

export const getProducts = () => api.get('/products');
export const createProduct = (productData) => api.post('/products', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// === ADD THIS LINE ===
export const createOrder = (orderData) => api.post('/orders', orderData);
// =====================

// === ADD THIS FUNCTION ===
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
// =========================

export const getOrders = () => api.get('/orders');