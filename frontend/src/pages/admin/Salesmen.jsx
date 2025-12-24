import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { PlusIcon, PrinterIcon, DownloadIcon, EyeIcon, UserCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const Salesmen = () => {
  const [salesmen, setSalesmen] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedSalesman, setSelectedSalesman] = useState(null)
  const [salesmanStats, setSalesmanStats] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadharNumber: '', 
    address: '',
    photoUrl: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    pin: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchSalesmen()
  }, [])

  const fetchSalesmen = async () => {
    try {
      const response = await api.get('/users/salesmen')
      setSalesmen(response.data)
    } catch (error) {
      console.error('Error fetching salesmen:', error)
      toast.error('Failed to fetch salesmen. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesmanStats = async (salesmanId) => {
    try {
      // Replace with your actual API endpoint
      const response = await api.get(`/orders/salesman/${salesmanId}/stats`)
      setSalesmanStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setSalesmanStats({
        totalOrders: 0,
        activeOrders: 0,
        rejectedOrders: 0,
        completedOrders: 0
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits'
    }
    
    if (!formData.aadharNumber) {
      newErrors.aadharNumber = 'Aadhar number is required'
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!formData.pin) {
      newErrors.pin = 'PIN is required'
    } else if (formData.pin.length < 4 || formData.pin.length > 6) {
      newErrors.pin = 'PIN must be 4-6 digits'
    }
    
    if (!formData.bankDetails.accountNumber) {
      newErrors.accountNumber = 'Account number is required'
    }
    
    if (!formData.bankDetails.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required'
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
      newErrors.ifscCode = 'IFSC code is invalid'
    }
    
    if (!formData.bankDetails.bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      const response = await api.post('/users/salesmen', formData)
      toast.success('Salesman created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchSalesmen()
      
      // Generate and download PDF
      generatePDF(response.data.salesman || response.data)
    } catch (error) {
      console.error('Error creating salesman:', error)
      toast.error(error.response?.data?.error || 'Failed to create salesman. Please check backend.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      aadharNumber: '',
      address: '',
      photoUrl: '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: ''
      },
      pin: ''
    })
    setErrors({})
  }

  const handleViewProfile = async (salesman) => {
    setSelectedSalesman(salesman)
    await fetchSalesmanStats(salesman._id)
    setShowProfileModal(true)
  }

  const generatePDF = async (salesman, action = 'download') => {
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(40, 53, 147)
      doc.text('CYSTAS DEVSOFT PRIVATE LIMITED', 105, 20, null, null, 'center')
      
      doc.setFontSize(16)
      doc.setTextColor(59, 130, 246)
      doc.text('QR Guard Technologies', 105, 30, null, null, 'center')
      
      doc.setFontSize(14)
      doc.setTextColor(100, 116, 139)
      doc.text('Salesman Registration Certificate', 105, 40, null, null, 'center')
      
      // Line separator
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 45, 190, 45)
      
      let startY = 55
      
      // Salesman Photo
      if (salesman.photoUrl) {
        try {
          const img = new Image()
          img.crossOrigin = 'Anonymous'
          img.src = salesman.photoUrl
          
          img.onload = () => {
            try {
              doc.addImage(img, 'JPEG', 160, startY, 30, 40)
            } catch (imgError) {
              console.error('Error adding image to PDF:', imgError)
            }
          }
        } catch (error) {
          console.error('Error processing image:', error)
        }
      }
      
      // Salesman Details
      const details = [
        ['Salesman ID:', salesman.userId || salesman._id?.substring(0, 8).toUpperCase() || 'N/A'],
        ['Full Name:', salesman.name || 'N/A'],
        ['Email:', salesman.email || 'N/A'],
        ['Mobile:', salesman.mobile || 'N/A'],
        ['Aadhar Number:', salesman.aadharNumber || 'N/A'],
        ['Address:', salesman.address || 'N/A'],
        ['Registration Date:', new Date(salesman.createdAt || Date.now()).toLocaleDateString()],
        ['', ''],
        ['Bank Details:', ''],
        ['Account Number:', salesman.bankDetails?.accountNumber || 'N/A'],
        ['IFSC Code:', salesman.bankDetails?.ifscCode || 'N/A'],
        ['Bank Name:', salesman.bankDetails?.bankName || 'N/A'],
        ['', ''],
        ['Login Information:', ''],
        ['Mobile:', salesman.mobile || 'N/A'],
        ['PIN:', salesman.pin ? '******' : 'Not Set']
      ]
      
      autoTable(doc, {
        startY: startY,
        theme: 'plain',
        styles: { 
          fontSize: 10,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold'
        },
        columnStyles: { 
          0: { 
            cellWidth: 50, 
            fontStyle: 'bold',
            fillColor: [249, 250, 251]
          },
          1: { 
            cellWidth: 130,
            fillColor: [255, 255, 255]
          }
        },
        body: details,
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8)
          doc.setTextColor(128, 128, 128)
          doc.text(
            `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | Page ${data.pageNumber}`,
            105,
            doc.internal.pageSize.height - 10,
            null,
            null,
            'center'
          )
        }
      })
      
      if (action === 'download') {
        doc.save(`Salesman_${salesman.userId || salesman.name || 'profile'}.pdf`)
      } else if (action === 'print') {
        const pdfBlob = doc.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob)
        const printWindow = window.open(pdfUrl)
        
        // Wait for PDF to load before printing
        setTimeout(() => {
          printWindow?.print()
          // Clean up URL after printing
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
        }, 1000)
      }
      
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const handlePrint = (salesman) => {
    generatePDF(salesman, 'print')
  }

  const handleDeleteSalesman = async (salesmanId) => {
    if (window.confirm('Are you sure you want to delete this salesman?')) {
      try {
        await api.delete(`/users/salesmen/${salesmanId}`)
        toast.success('Salesman deleted successfully')
        fetchSalesmen()
      } catch (error) {
        console.error('Error deleting salesman:', error)
        toast.error('Failed to delete salesman')
      }
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Salesmen Management</h1>
            <p className="mt-2 text-gray-600">Create and manage salesman accounts</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Salesman
          </button>
        </div>

        {/* Salesmen Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aadhar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesmen.length > 0 ? (
                  salesmen.map((salesman) => (
                    <tr key={salesman._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {salesman.userId || salesman._id?.substring(0, 8).toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {salesman.photoUrl ? (
                            <img
                              src={salesman.photoUrl}
                              alt={salesman.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(salesman.name)}&background=random`
                              }}
                            />
                          ) : (
                            <UserCircleIcon className="w-10 h-10 text-gray-400 mr-3" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{salesman.name}</div>
                            <div className="text-sm text-gray-500">{salesman.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{salesman.mobile}</div>
                        <div className="text-sm text-gray-500">{salesman.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salesman.aadharNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{salesman.bankDetails?.bankName || 'N/A'}</div>
                        <div className="text-xs text-gray-400">A/C: {salesman.bankDetails?.accountNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProfile(salesman)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="View Profile"
                            type="button"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => generatePDF(salesman, 'download')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Download PDF"
                            type="button"
                          >
                            <DownloadIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handlePrint(salesman)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Print"
                            type="button"
                          >
                            <PrinterIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSalesman(salesman._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                            type="button"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9A5.5 5.5 0 0118 9.5V17m-6-6h6" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">No Salesmen Found</p>
                        <p className="text-gray-600">Get started by creating your first salesman</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Salesman Modal */}
        {showCreateModal && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowCreateModal(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-white border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Create New Salesman</h2>
                      <p className="text-gray-600 mt-1">Fill in the salesman details below</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-500 p-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter full name"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter email address"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.mobile ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter 10-digit mobile number"
                          />
                          {errors.mobile && (
                            <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aadhar Number *
                          </label>
                          <input
                            type="text"
                            name="aadharNumber"
                            value={formData.aadharNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.aadharNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter 12-digit Aadhar number"
                          />
                          {errors.aadharNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter complete address"
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photo URL (Optional)
                          </label>
                          <input
                            type="url"
                            name="photoUrl"
                            value={formData.photoUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>

                      {/* Bank Details & Login Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            name="bankDetails.bankName"
                            value={formData.bankDetails.bankName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.bankName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter bank name"
                          />
                          {errors.bankName && (
                            <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            name="bankDetails.accountNumber"
                            value={formData.bankDetails.accountNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter account number"
                          />
                          {errors.accountNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            name="bankDetails.ifscCode"
                            value={formData.bankDetails.ifscCode}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter IFSC code"
                          />
                          {errors.ifscCode && (
                            <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 pt-4">Login Information</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PIN (4-6 digits) *
                          </label>
                          <input
                            type="password"
                            name="pin"
                            value={formData.pin}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                              errors.pin ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter 4-6 digit PIN"
                          />
                          {errors.pin && (
                            <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Note: This PIN will be used by the salesman to login to the app
                          </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
                          <h4 className="font-medium text-blue-800 mb-2">Important Information</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• A PDF certificate will be generated after creation</li>
                            <li>• Salesman can login using mobile number and PIN</li>
                            <li>• Ensure all details are accurate before submission</li>
                            <li>• Bank details are required for commission payments</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="bg-gray-50 border-t px-6 py-4">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        resetForm()
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
                    >
                      Create Salesman
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* View Profile Modal */}
        {showProfileModal && selectedSalesman && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowProfileModal(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Salesman Profile</h2>
                      <p className="text-blue-100 mt-1">Complete profile and statistics</p>
                    </div>
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="text-white hover:text-blue-200 p-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  {/* Profile Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
                    <div className="flex-shrink-0">
                      {selectedSalesman.photoUrl ? (
                        <img
                          src={selectedSalesman.photoUrl}
                          alt={selectedSalesman.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSalesman.name)}&background=random&size=128`
                          }}
                        />
                      ) : (
                        <UserCircleIcon className="w-32 h-32 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedSalesman.name}</h3>
                      <p className="text-gray-600">{selectedSalesman.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          ID: {selectedSalesman.userId || selectedSalesman._id?.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          Mobile: {selectedSalesman.mobile}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => generatePDF(selectedSalesman, 'download')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors duration-200"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => handlePrint(selectedSalesman)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center transition-colors duration-200"
                      >
                        <PrinterIcon className="w-4 h-4 mr-2" />
                        Print
                      </button>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-blue-600 font-semibold">Total Orders</div>
                      <div className="text-3xl font-bold text-gray-900">{salesmanStats.totalOrders || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-green-600 font-semibold">Active Orders</div>
                      <div className="text-3xl font-bold text-gray-900">{salesmanStats.activeOrders || 0}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="text-yellow-600 font-semibold">Pending Orders</div>
                      <div className="text-3xl font-bold text-gray-900">{salesmanStats.pendingOrders || 0}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="text-red-600 font-semibold">Rejected Orders</div>
                      <div className="text-3xl font-bold text-gray-900">{salesmanStats.rejectedOrders || 0}</div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Details */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Aadhar Number</label>
                          <p className="text-gray-900">{selectedSalesman.aadharNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <p className="text-gray-900">{selectedSalesman.address}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Registration Date</label>
                          <p className="text-gray-900">
                            {new Date(selectedSalesman.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bank Name</label>
                          <p className="text-gray-900">{selectedSalesman.bankDetails?.bankName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Account Number</label>
                          <p className="text-gray-900">{selectedSalesman.bankDetails?.accountNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                          <p className="text-gray-900">{selectedSalesman.bankDetails?.ifscCode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border-t px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
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
      </div>
    </AdminLayout>
  )
}

export default Salesmen