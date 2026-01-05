import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'buyer'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })

      const data = await response.json()

      if (data.success) {
        navigate('/login')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <i className="fas fa-pen-fancy text-4xl text-sky-600 mr-3"></i>
            <span className="text-3xl font-bold text-gray-900">Lesorce</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Register as {role === 'buyer' ? 'Buyer' : 'Vendor'}
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Your Company Ltd."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="+20 XXX XXX XXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
