import { useState } from 'react'
import { SearchIcon, QrcodeIcon } from '@heroicons/react/outline'
import api from '../services/api'
import toast from 'react-hot-toast'

const QRStatus = () => {
  const [qrId, setQrId] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)

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

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!qrId.trim()) {
      toast.error('Please enter QR/VIN ID')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/orders/public/qr/${qrId}`)
      setOrder(response.data)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Order not found')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 text-white p-3 rounded-xl">
              <QrcodeIcon className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            QR Guard Technologies
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Vehicle Order Status Portal
          </p>
          <p className="mt-2 text-lg text-primary-600 font-medium">
            CYSTAS DEVSOFT PRIVATE LIMITED
          </p>
        </div>

        {/* Search Section */}
        <div className="card p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Check Your Vehicle Status</h2>
            <p className="mt-2 text-gray-600">
              Enter your QR Code ID or Vehicle Identification Number (VIN) to check the current status
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="qrId" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code / Vehicle ID
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    id="qrId"
                    value={qrId}
                    onChange={(e) => setQrId(e.target.value)}
                    placeholder="Enter QR/VIN number"
                    className="input-field"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  <SearchIcon className="w-5 h-5 mr-2" />
                  {loading ? 'Checking...' : 'Check Status'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the QR code number or Vehicle ID provided during order registration
              </p>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {order && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 bg-primary-50 border-b">
              <h3 className="text-lg font-semibold text-primary-800">Order Status Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Badge */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <p className="text-lg font-semibold">Order #{order.qrId}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Vehicle Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Vehicle Number</dt>
                      <dd className="text-sm font-medium">{order.customerId?.vehicleNo || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Model Name</dt>
                      <dd className="text-sm font-medium">{order.customerId?.modelName || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Customer Name</dt>
                      <dd className="text-sm font-medium">{order.customerId?.name || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Order Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Order Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Salesman</dt>
                      <dd className="text-sm font-medium">{order.salesmanId?.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Order Date</dt>
                      <dd className="text-sm font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Last Updated</dt>
                      <dd className="text-sm font-medium">
                        {new Date(order.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Admin Remark */}
                {order.remark && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Admin Remark</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{order.remark}</p>
                    </div>
                  </div>
                )}

                {/* Status Legend */}
                <div className="md:col-span-2 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-4">Status Legend</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-600">Accepted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-gray-600">Processed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-600">Rejected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Activated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            For any queries regarding your order status, please contact our support team
          </p>
          <p className="mt-2 text-sm text-gray-400">
            © {new Date().getFullYear()} CYSTAS DEVSOFT PRIVATE LIMITED. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QRStatus