import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { 
  SearchIcon, 
  FilterIcon,
  EyeIcon,
  PencilIcon,
  RefreshIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [salesmen, setSalesmen] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    salesmanId: '',
    startDate: '',
    endDate: '',
    search: ''
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    remark: ''
  })

  useEffect(() => {
    fetchSalesmen()
    fetchOrders()
  }, [])

  const fetchSalesmen = async () => {
    try {
      const response = await api.get('/users/salesmen')
      setSalesmen(response.data)
    } catch (error) {
      console.error('Failed to fetch salesmen:', error)
      toast.error('Failed to load salesmen list')
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.salesmanId) params.append('salesmanId', filters.salesmanId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.search) params.append('search', filters.search)

      const response = await api.get(`/orders/admin/orders?${params}`)
      setOrders(response.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to fetch orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchOrders()
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      salesmanId: '',
      startDate: '',
      endDate: '',
      search: ''
    })
    setTimeout(() => fetchOrders(), 100) // Small delay to ensure state update
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order)
    setStatusUpdate({
      status: order.status,
      remark: order.adminRemark || order.remark || ''
    })
    setShowStatusModal(true)
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/orders/admin/orders/${selectedOrder._id}/status`, statusUpdate)
      toast.success('Order status updated successfully')
      setShowStatusModal(false)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'processed': return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200'
      case 'activated': return 'bg-green-100 text-green-800 border border-green-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4 mr-1" />
      case 'accepted': return <CheckCircleIcon className="w-4 h-4 mr-1" />
      case 'processed': return <TruckIcon className="w-4 h-4 mr-1" />
      case 'rejected': return <XCircleIcon className="w-4 h-4 mr-1" />
      case 'activated': return <ShieldCheckIcon className="w-4 h-4 mr-1" />
      default: return <ClockIcon className="w-4 h-4 mr-1" />
    }
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getPaymentModeText = (mode) => {
    return mode === 'online' ? 'Online Payment' : 'Cash'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && orders.length === 0) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="mt-2 text-gray-600">View and manage all customer orders</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold">{orders.length} orders</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleFilterSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Orders
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Search by QR/VIN, Customer, Vehicle..."
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="processed">Processed</option>
                  <option value="rejected">Rejected</option>
                  <option value="activated">Activated</option>
                </select>
              </div>

              {/* Salesman */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salesman
                </label>
                <select
                  name="salesmanId"
                  value={filters.salesmanId}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">All Salesmen</option>
                  {salesmen.map(salesman => (
                    <option key={salesman._id} value={salesman._id}>
                      {salesman.name} ({salesman.userId || salesman.mobile})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
              >
                Clear All
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
              >
                <FilterIcon className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salesman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <TruckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.qrId || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Order #{order.orderNumber || order._id?.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customer?.name || order.customerId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer?.vehicleNo || order.customerId?.vehicleNo || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.customer?.mobile || order.customerId?.mobile || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.salesman?.name || order.salesmanId?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {order.salesman?.userId || order.salesmanId?.userId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          order.payment?.mode === 'online' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {order.payment?.mode === 'online' ? '💳 Online' : '💵 Cash'}
                        </div>
                        {order.payment?.transactionId && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                            Txn: {order.payment.transactionId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        {order.remark && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" title={order.remark}>
                            {order.remark}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Update Status"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">Try changing your filters or check back later</p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Order Modal */}
        {showViewModal && selectedOrder && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowViewModal(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Order Details</h2>
                      <p className="text-blue-100 mt-1">Complete order information</p>
                    </div>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-white hover:text-blue-200 p-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Order ID</label>
                          <p className="text-gray-900 font-mono">{selectedOrder.qrId || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Order Number</label>
                          <p className="text-gray-900">{selectedOrder.orderNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusIcon(selectedOrder.status)}
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created Date</label>
                          <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Mode</label>
                          <p className="text-gray-900">{getPaymentModeText(selectedOrder.payment?.mode)}</p>
                        </div>
                        {selectedOrder.payment?.transactionId && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                            <p className="text-gray-900 font-mono">{selectedOrder.payment.transactionId}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Status</label>
                          <p className="text-gray-900">{selectedOrder.payment?.status || 'Pending'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-gray-900">{selectedOrder.customer?.name || selectedOrder.customerId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Mobile</label>
                          <p className="text-gray-900">{selectedOrder.customer?.mobile || selectedOrder.customerId?.mobile || 'N/A'}</p>
                        </div>
                        <div>
                          <div>
                          <label className="text-sm font-medium text-gray-500">Mobile</label>
                          <p className="text-gray-900">{selectedOrder.customer?.driverMobile || selectedOrder.customerId?.driverMobile || 'N/A'}</p>
                        </div>
                        <div></div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedOrder.customer?.email || selectedOrder.customerId?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vehicle Details</label>
                          <p className="text-gray-900">
                            {selectedOrder.customer?.vehicleNo || selectedOrder.customerId?.vehicleNo || 'N/A'} - 
                            {selectedOrder.customer?.modelName || selectedOrder.customerId?.modelName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Salesman Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Salesman Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-gray-900">{selectedOrder.salesman?.name || selectedOrder.salesmanId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Salesman ID</label>
                          <p className="text-gray-900">{selectedOrder.salesman?.userId || selectedOrder.salesmanId?.userId || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Mobile</label>
                          <p className="text-gray-900">{selectedOrder.salesman?.mobile || selectedOrder.salesmanId?.mobile || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {(selectedOrder.remark || selectedOrder.adminRemark) && (
                    <div className="mt-6 bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Remarks</h4>
                      {selectedOrder.remark && (
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-500">Salesman Remark</label>
                          <p className="text-gray-900">{selectedOrder.remark}</p>
                        </div>
                      )}
                      {selectedOrder.adminRemark && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Admin Remark</label>
                          <p className="text-gray-900">{selectedOrder.adminRemark}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border-t px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowViewModal(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowStatusModal(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Update Order Status</h2>
                      <p className="text-green-100 mt-1">Change order status and add remarks</p>
                    </div>
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="text-white hover:text-green-200 p-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleStatusSubmit} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-sm font-medium text-blue-900">Order #{selectedOrder.qrId}</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Customer: {selectedOrder.customer?.name || selectedOrder.customerId?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-blue-700">
                        Vehicle: {selectedOrder.customer?.vehicleNo || selectedOrder.customerId?.vehicleNo || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select New Status *
                      </label>
                      <select
                        name="status"
                        value={statusUpdate.status}
                        onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="processed">Processed</option>
                        <option value="rejected">Rejected</option>
                        <option value="activated">Activated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Remark (Optional)
                      </label>
                      <textarea
                        name="remark"
                        value={statusUpdate.remark}
                        onChange={(e) => setStatusUpdate(prev => ({ ...prev, remark: e.target.value }))}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        rows="4"
                        placeholder="Add remarks about status change..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowStatusModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
                      >
                        Update Status
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default Orders