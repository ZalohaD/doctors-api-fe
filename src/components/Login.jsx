import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, Mail, Lock } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'
import { useEffect } from 'react'


const Login = ({ setUser }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUser({ token: data.token, user: data.user })
        navigate('/')
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.message || 'Помилка входу' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Помилка з\'єднання з сервером' })
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth callback
  const handleGoogleCallback = () => {
    // This function will be called when the page loads after Google redirect
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const error = urlParams.get('error')

    if (token) {
      try {
        const userData = JSON.parse(urlParams.get('user') || '{}')
        localStorage.setItem('token', token)
        setUser({ token, user: userData })
        // Clear URL params and redirect
        window.history.replaceState({}, document.title, window.location.pathname)
        navigate('/')
      } catch (err) {
        console.error('Error parsing Google auth data:', err)
        setErrors({ general: 'Помилка обробки Google авторизації' })
      }
    } else if (error) {
      setErrors({ general: 'Помилка Google авторизації: ' + error })
    }
  }

  // Check for Google callback on component mount
  useEffect(() => {
    handleGoogleCallback()
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Вхід в систему</CardTitle>
          <CardDescription>
            Увійдіть до свого облікового запису
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.general && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Введіть ваш email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Введіть пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password[0]}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вхід...' : 'Увійти'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white text-gray-500">або</span>
            </div>
          </div>

          <GoogleLoginButton />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Не маєте облікового запису?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Зареєструватися
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login