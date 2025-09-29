import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Stethoscope } from 'lucide-react'
import { API_BASE_URL } from '@/core/constants'

const DoctorRegister = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    clinic_id: '',
    specializations: [],
    available_time: []
  })
  const [options, setOptions] = useState({ clinics: [], specializations: {} })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2,'0')}:00`)

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-options`, {
        headers: { 'Accept': 'application/json' }
      })
      const data = await response.json()
      if (response.ok) setOptions(data)
    } catch (error) {
      console.error('Error fetching options:', error)
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleAddTime = () => {
    setFormData(prev => ({
      ...prev,
      available_time: [...prev.available_time, { day: '', from: '', to: '' }]
    }))
  }

  const handleTimeChange = (index, field, value) => {
    const newTime = [...formData.available_time]
    newTime[index][field] = value

    // Перевірка валідності: to пізніше from
    const fromIndex = hours.indexOf(newTime[index].from)
    const toIndex = hours.indexOf(newTime[index].to)
    if (fromIndex !== -1 && toIndex !== -1 && toIndex <= fromIndex) {
      newTime[index].to = ''
    }

    setFormData(prev => ({ ...prev, available_time: newTime }))
  }

  const handleRemoveTime = (index) => {
    const newTime = [...formData.available_time]
    newTime.splice(index, 1)
    setFormData(prev => ({ ...prev, available_time: newTime }))
  }

  const handleSpecializationChange = (key, checked) => {
    setFormData(prev => ({
      ...prev,
      specializations: checked
        ? [...prev.specializations, key]
        : prev.specializations.filter(s => s !== key)
    }))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setErrors({})

  try {
    const payload = {
      ...formData,
      specialization: formData.specializations
    }
    delete payload.specializations

    const response = await fetch('http://127.0.0.1:8001/api/register-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (response.ok) {
      alert('Реєстрація лікаря успішна!')
      navigate('/login-doctor')
    } else {
      setErrors(data.errors || { general: data.message || 'Помилка реєстрації' })
    }
  } catch (error) {
    setErrors({ general: 'Помилка з’єднання з сервером' })
  } finally {
    setLoading(false)
  }
}


  if (loadingOptions) return <div className="text-center mt-10">Завантаження...</div>

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Реєстрація лікаря</CardTitle>
          <CardDescription>Створіть обліковий запис</CardDescription>
        </CardHeader>
        <CardContent>
          {errors.general && <div className="text-red-600 mb-4">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Особисті дані */}
            <div><Label>Ім’я</Label><Input name="first_name" value={formData.first_name} onChange={e => setFormData({...formData, first_name:e.target.value})} /></div>
            <div><Label>Прізвище</Label><Input name="last_name" value={formData.last_name} onChange={e => setFormData({...formData, last_name:e.target.value})} /></div>
            <div><Label>Адреса</Label><Input name="address" value={formData.address} onChange={e => setFormData({...formData, address:e.target.value})} /></div>
            <div><Label>Email</Label><Input name="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email:e.target.value})} /></div>
            <div><Label>Телефон</Label><Input name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone:e.target.value})} /></div>

            {/* Клініка */}
            <div>
              <Label>Клініка</Label>
              <Select onValueChange={val => setFormData({...formData, clinic_id: val})} value={formData.clinic_id}>
                <SelectTrigger><SelectValue placeholder="Оберіть клініку" /></SelectTrigger>
                <SelectContent>
                  {options.clinics.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Спеціалізації */}
            <div>
              <Label>Спеціалізації</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {options.specializations.map(spec => (
                  <div key={spec.value} className="flex items-center space-x-2 mb-1">
                    <Checkbox
                      id={spec.value}
                      checked={formData.specializations.includes(spec.value)}
                      onCheckedChange={checked => handleSpecializationChange(spec.value, checked)}
                    />
                    <Label htmlFor={spec.value}>{spec.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Доступний час */}
            <div>
              <Label>Доступний час</Label>
              {formData.available_time.map((time, idx) => (
                <div key={idx} className="flex items-center space-x-2 mb-2">
                  <Select value={time.day} onValueChange={val => handleTimeChange(idx, 'day', val)}>
                    <SelectTrigger><SelectValue placeholder="День" /></SelectTrigger>
                    <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={time.from} onValueChange={val => handleTimeChange(idx, 'from', val)}>
                    <SelectTrigger><SelectValue placeholder="Від" /></SelectTrigger>
                    <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={time.to} onValueChange={val => handleTimeChange(idx, 'to', val)}>
                    <SelectTrigger><SelectValue placeholder="До" /></SelectTrigger>
                    <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" onClick={() => handleRemoveTime(idx)}>Видалити</Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddTime}>Додати день</Button>
            </div>

            {/* Пароль */}
            <div><Label>Пароль</Label><Input name="password" type="password" value={formData.password} onChange={e => setFormData({...formData,password:e.target.value})} /></div>
            <div><Label>Підтвердження паролю</Label><Input name="password_confirmation" type="password" value={formData.password_confirmation} onChange={e => setFormData({...formData,password_confirmation:e.target.value})} /></div>

            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Реєстрація...' : 'Зареєструватися'}</Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Вже маєте акаунт? <Link to="/login-doctor" className="text-green-600">Увійти</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorRegister
