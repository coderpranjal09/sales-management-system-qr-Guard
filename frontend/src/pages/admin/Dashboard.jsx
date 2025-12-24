import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { 
  UsersIcon, 
  ClipboardListIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSalesmen: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [salesmenRes, ordersRes] = await Promise.all([
        api.get('/users/salesmen'),
        api.get('/orders/admin/orders')
      ])

      const salesmen = salesmenRes.data
      const orders = ordersRes.data

      const pendingOrders = orders.filter(order => order.status === 'pending').length
      const completedOrders = orders.filter(order => 
        ['accepted', 'processed', 'activated'].includes(order.status)
      ).length

      setStats({
        totalSalesmen: salesmen.length,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders
      })

      setRecentOrders(orders.slice(0, 5))
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-5 h-5" />
      case 'activated': return <CheckCircleIcon className="w-5 h-5" />
      case 'rejected': return <XCircleIcon className="w-5 h-5" />
      default: return <CheckCircleIcon className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to QR Guard Technologies Administration Portal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Salesmen</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSalesmen}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardListIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>
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
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salesman
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
                      {order.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerId?.vehicleNo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.salesmanId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 ${getStatusColor(order.status)} px-2 py-1 rounded-full text-xs`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/salesmen"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-700">Create New Salesman</span>
                <UsersIcon className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="/admin/orders"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-700">Manage Orders</span>
                <ClipboardListIcon className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Company</dt>
                <dd className="text-sm font-medium">CYSTAS DEVSOFT PRIVATE LIMITED</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Application</dt>
                <dd className="text-sm font-medium">QR Guard Technologies</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Version</dt>
                <dd className="text-sm font-medium">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Last Updated</dt>
                <dd className="text-sm font-medium">{new Date().toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard