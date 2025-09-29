import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, Mail, Lock } from 'lucide-react'
import { API_BASE_URL } from '@/core/constants'

const DoctorLogin = ({ setUser }) => {
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

  // У DoctorLogin.jsx - оновіть handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setErrors({})

  try {
    const response = await fetch(`${API_BASE_URL}/api/login-doctor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (response.ok) {
      // Зберігаємо і токен і дані лікаря
      localStorage.setItem('token', data.token)
      localStorage.setItem('doctor', JSON.stringify(data.doctor))
      setUser({ token: data.token, doctor: data.doctor })
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

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Вхід для лікарів</CardTitle>
          <CardDescription>
            Увійдіть до свого облікового запису лікаря
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
              {loading ? 'Вхід...' : 'Увійти як лікар'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Не маєте облікового запису лікаря?{' '}
              <Link to="/register-doctor" className="text-green-600 hover:underline">
                Зареєструватися як лікар
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorLogin

