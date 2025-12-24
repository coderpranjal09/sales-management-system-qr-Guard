import React from "react";
import {  Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

// Public Pages
import Login from './pages/Login'
import QRStatus from './pages/QRStatus'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import Salesmen from './pages/admin/Salesmen'
import AdminOrders from './pages/admin/Orders'

// Salesman Pages
import SalesmanDashboard from './pages/salesman/Dashboard'
import CreateOrder from './pages/salesman/CreateOrder'
import SalesmanOrders from './pages/salesman/Orders'

function App() {
  return (
    <div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/qr-status" element={<QRStatus />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/salesmen" element={
            <ProtectedRoute role="admin">
              <Salesmen />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          } />
          
          {/* Salesman Routes */}
          <Route path="/salesman" element={
            <ProtectedRoute role="salesman">
              <SalesmanDashboard />
            </ProtectedRoute>
          } />
          <Route path="/salesman/create-order" element={
            <ProtectedRoute role="salesman">
              <CreateOrder />
            </ProtectedRoute>
          } />
          <Route path="/salesman/orders" element={
            <ProtectedRoute role="salesman">
              <SalesmanOrders />
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
  )
}

export default App