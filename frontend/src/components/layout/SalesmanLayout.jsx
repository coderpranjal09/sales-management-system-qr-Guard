import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ClipboardListIcon, 
  LogoutIcon,
  MenuIcon,
  XIcon,
  QrcodeIcon
} from '@heroicons/react/outline'

const SalesmanLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/salesman', icon: HomeIcon },
    { name: 'Create Order', href: '/salesman/create-order', icon: PlusCircleIcon },
    { name: 'My Orders', href: '/salesman/orders', icon: ClipboardListIcon },
    { name: 'QR Status', href: '/qr-status', icon: QrcodeIcon, external: true },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64">
          <div className="relative flex flex-col w-full max-w-xs bg-white">
            <div className="flex items-center justify-between px-4 py-6 border-b">
              <div>
                <span className="text-xl font-bold text-primary-700">QR Guard</span>
                <p className="text-sm text-gray-600">Salesman Portal</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="px-4 py-4 border-b">
              <div className="flex items-center space-x-3">
                {user?.photoUrl && (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border"
                  />
                )}
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">ID: {user?.userId}</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sidebar-link"
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </a>
                  )
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`sidebar-link ${location.pathname === item.href ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col w-64 border-r bg-white">
          <div className="px-6 py-8 border-b">
            <h1 className="text-2xl font-bold text-primary-700">QR Guard</h1>
            <p className="mt-1 text-sm text-gray-600">Salesman Portal</p>
          </div>
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              {user?.photoUrl && (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border"
                />
              )}
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-500">ID: {user?.userId}</p>
                <p className="text-xs text-gray-400">Salesman</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              if (item.external) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-link"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                )
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${location.pathname === item.href ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogoutIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">Salesman ID: {user?.userId}</p>
              </div>
            </div>
          </div>
        </div>
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SalesmanLayout