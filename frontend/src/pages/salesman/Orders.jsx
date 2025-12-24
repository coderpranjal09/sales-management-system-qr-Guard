import { useState, useEffect } from 'react'
import SalesmanLayout from '../../components/layout/SalesmanLayout'
import { SearchIcon, EyeIcon } from '@heroicons/react/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SalesmanOrders = () => {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/salesman/orders')
      setOrders(response.data.orders)
      setStats(response.data.stats)
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'accepted': return 'status-accepted'
      case 'processed': return 'status-processed'
      case 'rejected': return 'status-rejected'
      case 'activated': return 'status-activated'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase()
    return (
      order.qrId.toLowerCase().includes(searchLower) ||
      order.customerId?.name.toLowerCase().includes(searchLower) ||
      order.customerId?.vehicleNo.toLowerCase().includes(searchLower) ||
      order.customerId?.mobile.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <SalesmanLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </SalesmanLayout>
    )
  }

  return (
    <SalesmanLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">View and track all your orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.accepted || 0}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.processed || 0}</div>
              <div className="text-sm text-gray-600">Processed</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activated || 0}</div>
              <div className="text-sm text-gray-600">Activated</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by QR ID, Customer, Vehicle, or Mobile..."
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR/VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
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
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.qrId}</div>
                      <div className="text-xs text-gray-500">Order ID</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerId?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerId?.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerId?.vehicleNo}</div>
                      <div className="text-xs text-gray-500">{order.customerId?.modelName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.payment.mode === 'online' ? 'Online' : 'Cash'}
                      </div>
                      {order.payment.transactionId && (
                        <div className="text-xs text-gray-500">
                          Txn: {order.payment.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.remark && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {order.remark}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <SearchIcon className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">No orders found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </SalesmanLayout>
  )
}

export default SalesmanOrders