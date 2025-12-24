import { useState, useEffect } from 'react'
import SalesmanLayout from '../../components/layout/SalesmanLayout'
import { Link } from 'react-router-dom'
import { 
  ClipboardListIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SalesmanDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    processed: 0,
    rejected: 0,
    activated: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/orders/salesman/orders')
      setStats(response.data.stats)
      setRecentOrders(response.data.orders.slice(0, 5))
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
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
          <h1 className="text-2xl font-bold text-gray-900">Salesman Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to QR Guard Technologies Salesman Portal</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.processed}</div>
              <div className="text-sm text-gray-600">Processed</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activated}</div>
              <div className="text-sm text-gray-600">Activated</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/salesman/create-order"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <PlusCircleIcon className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Order</h3>
                <p className="mt-1 text-gray-600">Register new customer and create order</p>
              </div>
            </div>
          </Link>

          <Link
            to="/salesman/orders"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardListIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">View All Orders</h3>
                <p className="mt-1 text-gray-600">Check status of all your orders</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.qrId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerId?.vehicleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.payment.mode === 'online' ? 'Online' : 'Cash'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SalesmanLayout>
  )
}

export default SalesmanDashboard