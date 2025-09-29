import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageCircle, User, Calendar, AlertCircle, CheckCircle2, Star, ArrowLeft, Phone, Mail, MapPin, Stethoscope, Building2, ChevronLeft, ChevronRight, Edit2, Plus } from 'lucide-react'
import { API_BASE_URL } from '@/core/constants'

const DoctorProfile = ({ user }) => {
  const { id } = useParams()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    specialization: '',
    is_active: true
  })
  
  // Стани для форми запису
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointmentFormData, setAppointmentFormData] = useState({
    from: '',
    to: '',
    firstname: '',
    lastname: '',
    status: 1
  })
  const [appointmentError, setAppointmentError] = useState('')
  const [appointmentSuccess, setAppointmentSuccess] = useState('')

  const isLoggedIn = !!localStorage.getItem("token")
  const isDoctor = user?.id === parseInt(id)

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const endpoint = isDoctor ? `${API_BASE_URL}/api/doctor/me` : `${API_BASE_URL}/api/doctor/${id}`
        const res = await fetch(endpoint, {
          headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        })
        if (!res.ok) throw new Error('Помилка завантаження профілю')
        const data = await res.json()
        setDoctor(data)
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          available_time: data.available_time || []
        })
        setReviews(data.reviews || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorProfile()
  }, [id, isDoctor])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedAppointment) { setReviewError('Виберіть візит'); return }
    if (!comment.trim()) { setReviewError('Напишіть коментар'); return }

    const token = localStorage.getItem("token")
    if (!token) { setReviewError('Користувач не авторизований'); return }

    try {
      const res = await fetch(`${API_BASE_URL}/api/submit-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_id: selectedAppointment,
          comment: comment.trim(),
          rating
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews([data, ...reviews])
        setSelectedAppointment('')
        setComment('')
        setRating(5)
        setReviewError('')
        setReviewSuccess('Відгук додано!')
        setCurrentReviewIndex(0)
        setTimeout(() => setReviewSuccess(''), 5000)
      } else {
        const errorData = await res.json()
        setReviewError(errorData.message || 'Помилка при додаванні відгуку')
      }
    } catch (err) {
      setReviewError('Помилка з\'єднання з сервером')
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const data = await res.json()
        setDoctor(data)
        setIsEditing(false)
      } else {
        const errorData = await res.json()
        setError(errorData.message || 'Помилка оновлення профілю')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    
    if (!serviceFormData.name.trim()) {
      setError('Введіть назву послуги')
      return
    }
    if (!serviceFormData.price || parseFloat(serviceFormData.price) <= 0) {
      setError('Введіть коректну ціну')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...serviceFormData,
          name: serviceFormData.name.trim(),
          price: parseFloat(serviceFormData.price),
          duration: parseInt(serviceFormData.duration)
        })
      })
      if (res.ok) {
        const newService = await res.json()
        setDoctor(prev => ({
          ...prev,
          services: [...(prev.services || []), newService]
        }))
        setServiceFormData({
          name: '',
          description: '',
          price: '',
          duration: '30',
          specialization: '',
          is_active: true
        })
        setShowServiceForm(false)
        setError('')
      } else {
        const errorData = await res.json()
        setError(errorData.message || 'Помилка створення послуги')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    }
  }

  // ---------- Логіка бронювання послуги ----------
  const [selectedService, setSelectedService] = useState(null)
  const [serviceBookingForm, setServiceBookingForm] = useState({
    date: '',
    time: '',
    firstname: '',
    lastname: ''
  })
  const [serviceBookingError, setServiceBookingError] = useState('')
  const [serviceBookingSuccess, setServiceBookingSuccess] = useState('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])

  const pad = (n) => String(n).padStart(2, '0')
  const formatYmdHi = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`

  const generateTimeSlots = (availableTime, selectedDate, serviceDuration) => {
    if (!availableTime || !selectedDate || !serviceDuration) return []

    const selectedDayOfWeek = new Date(`${selectedDate}T00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const daySchedule = availableTime.find(s => s.day.toLowerCase() === selectedDayOfWeek)

    if (!daySchedule) return []

    const slots = []
    const [startHour, startMinute] = daySchedule.from.split(':').map(Number)
    const [endHour, endMinute] = daySchedule.to.split(':').map(Number)

    const startTime = new Date()
    startTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date()
    endTime.setHours(endHour, endMinute, 0, 0)

    const current = new Date(startTime)

    while (current.getTime() + (serviceDuration * 60000) <= endTime.getTime()) {
      slots.push(current.toTimeString().slice(0, 5))
      current.setMinutes(current.getMinutes() + 30)
    }

    return slots
  }

  const handleServiceDateChange = (date, service) => {
    setServiceBookingForm(prev => ({ ...prev, date, time: '' }))
    const slots = generateTimeSlots(doctor?.available_time || [], date, service.duration)
    setAvailableTimeSlots(slots)
  }

  const handleServiceBooking = async (e) => {
    e.preventDefault()

    if (!selectedService || !serviceBookingForm.date || !serviceBookingForm.time) {
      setServiceBookingError('Заповніть всі обов\'язкові поля')
      return
    }
    if (!serviceBookingForm.firstname.trim() || !serviceBookingForm.lastname.trim()) {
      setServiceBookingError('Введіть ім\'я та прізвище')
      return
    }

    const startTime = new Date(`${serviceBookingForm.date}T${serviceBookingForm.time}:00`)
    const endTime = new Date(startTime.getTime() + (selectedService.duration * 60000))

    if (endTime <= startTime) {
      setServiceBookingError('Час завершення має бути більший за початок')
      return
    }
    if (startTime < new Date()) {
      setServiceBookingError('Не можна забронювати час у минулому')
      return
    }

    const fromDateTime = formatYmdHi(startTime)
    const toDateTime = formatYmdHi(endTime)

    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          doctor_id: parseInt(id, 10),
          from: fromDateTime,
          to: toDateTime,
          firstname: serviceBookingForm.firstname.trim(),
          lastname: serviceBookingForm.lastname.trim(),
          status: 1,
          service_id: selectedService.id
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const messages = Object.values(data.errors).flat().join('\n')
          setServiceBookingError(messages)
        } else {
          setServiceBookingError(data.message || 'Помилка бронювання послуги')
        }
        return
      }

      setServiceBookingSuccess(`Послугу "${selectedService.name}" заброньовано на ${serviceBookingForm.date} о ${serviceBookingForm.time} ✅`)
      setServiceBookingError('')
      setServiceBookingForm({ date: '', time: '', firstname: '', lastname: '' })
      setSelectedService(null)
      setAvailableTimeSlots([])

      setTimeout(() => setServiceBookingSuccess(''), 5000)
    } catch (err) {
      setServiceBookingError("Помилка з'єднання з сервером")
    }
  }

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) => Math.max(0, prev - 1))
  }
  const handleNextReview = () => {
    setCurrentReviewIndex((prev) => Math.min(prev + 1, Math.ceil(reviews.length / 3) - 1))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-lg text-gray-600 animate-pulse">
        Завантаження профілю...
      </div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full space-y-4">
        <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl p-4">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2 border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Повернутися до списку лікарів</span>
          </Button>
        </Link>
      </div>
    </div>
  )

  if (!doctor) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Повернутися до списку лікарів</span>
          </Button>
        </Link>

        {/* Success message for appointment */}
        {appointmentSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {appointmentSuccess}
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white rounded-xl shadow-sm border-none overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <span className="text-lg text-gray-600">Лікар</span>
                </div>
                {isDoctor && (
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Скасувати' : 'Редагувати профіль'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ім'я</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Прізвище</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Адреса</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Зберегти зміни
                </Button>
              </form>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Контактна інформація</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctor.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Телефон</p>
                          <p className="font-medium text-gray-900">{doctor.phone}</p>
                        </div>
                      </div>
                    )}
                    {doctor.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{doctor.email}</p>
                        </div>
                      </div>
                    )}
                    {doctor.address && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Адреса</p>
                          <p className="font-medium text-gray-900">{doctor.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(doctor.services?.length > 0 || isDoctor) && (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">Послуги</h3>
      {isDoctor && (
        <Button 
          onClick={() => setShowServiceForm(!showServiceForm)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Додати послугу
        </Button>
      )}
    </div>

    {/* Success message for service booking */}
    {serviceBookingSuccess && (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          {serviceBookingSuccess}
        </AlertDescription>
      </Alert>
    )}

    {showServiceForm && isDoctor && (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <form onSubmit={handleServiceSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Назва послуги</label>
              <input
                type="text"
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ціна (грн)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={serviceFormData.price}
                onChange={(e) => setServiceFormData({...serviceFormData, price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тривалість (хв)</label>
              <input
                type="number"
                min="15"
                max="240"
                value={serviceFormData.duration}
                onChange={(e) => setServiceFormData({...serviceFormData, duration: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Спеціалізація</label>
              <input
                type="text"
                value={serviceFormData.specialization}
                onChange={(e) => setServiceFormData({...serviceFormData, specialization: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Опис</label>
            <textarea
              value={serviceFormData.description}
              onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Опис послуги..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Створити послугу
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowServiceForm(false)}
              className="px-6 py-2"
            >
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    )}

    {doctor.services?.length > 0 && (
      <div className="grid gap-4">
        {doctor.services.map(service => (
          <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                {service.description && (
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                )}
                {service.specialization && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-2">
                    {service.specialization}
                  </Badge>
                )}
              </div>
              <div className="text-right ml-4">
                <div className="mb-3">
                  <span className="text-lg font-semibold text-green-600">{service.price} грн</span>
                  <p className="text-sm text-gray-500">{service.duration} хв</p>
                </div>
                {!isDoctor && isLoggedIn && (
                  <Button
                    onClick={() => {
                      setSelectedService(service)
                      setServiceBookingForm({
                        date: '',
                        time: '',
                        firstname: '',
                        lastname: ''
                      })
                      setAvailableTimeSlots([])
                      setServiceBookingError('')
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                    size="sm"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Забронювати
                  </Button>
                )}
                {!isDoctor && !isLoggedIn && (
                  <p className="text-xs text-gray-500">
                    <Link to="/login" className="text-blue-600 hover:underline">
                      Увійти
                    </Link> для бронювання
                  </p>
                )}
              </div>
            </div>

            {/* Форма бронювання конкретної послуги */}
            {selectedService?.id === service.id && !isDoctor && isLoggedIn && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-t border-blue-200">
                <h5 className="font-medium text-gray-900 mb-3">
                  Бронювання: {service.name}
                </h5>
                
                <form onSubmit={handleServiceBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Дата
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={serviceBookingForm.date}
                        onChange={(e) => handleServiceDateChange(e.target.value, service)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Час
                      </label>
                      <select
                        value={serviceBookingForm.time}
                        onChange={(e) => setServiceBookingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                        disabled={!serviceBookingForm.date || availableTimeSlots.length === 0}
                      >
                        <option value="">
                          {!serviceBookingForm.date 
                            ? 'Спочатку оберіть дату' 
                            : availableTimeSlots.length === 0 
                              ? 'Немає доступного часу' 
                              : 'Оберіть час'
                          }
                        </option>
                        {availableTimeSlots.map(slot => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ім'я</label>
                      <input
                        type="text"
                        value={serviceBookingForm.firstname}
                        onChange={(e) => setServiceBookingForm(prev => ({ ...prev, firstname: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Прізвище</label>
                      <input
                        type="text"
                        value={serviceBookingForm.lastname}
                        onChange={(e) => setServiceBookingForm(prev => ({ ...prev, lastname: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {serviceBookingError && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">
                        {serviceBookingError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {serviceBookingForm.date && serviceBookingForm.time && (
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">
                        <strong>Підтвердження:</strong> {service.name} на {serviceBookingForm.date} о {serviceBookingForm.time}
                        <br />
                        <strong>Тривалість:</strong> {service.duration} хвилин
                        <br />
                        <strong>Вартість:</strong> {service.price} грн
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                      disabled={!serviceBookingForm.date || !serviceBookingForm.time || !serviceBookingForm.firstname.trim() || !serviceBookingForm.lastname.trim()}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Підтвердити бронювання
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedService(null)
                        setServiceBookingForm({
                          date: '',
                          time: '',
                          firstname: '',
                          lastname: ''
                        })
                        setServiceBookingError('')
                        setAvailableTimeSlots([])
                      }}
                      className="px-4 py-2"
                    >
                      Скасувати
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
                {/* Available Time */}
                {doctor.available_time?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Графік роботи</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {doctor.available_time.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <p className="text-sm text-gray-900">
                            {slot.day}: {slot.from} – {slot.to}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.specializations?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Спеціалізації</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specializations.map((spec, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.clinics?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Клініки</h3>
                    <div className="grid gap-3">
                      {doctor.clinics.map(clinic => (
                        <div 
                          key={clinic.id} 
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{clinic.name}</p>
                            {clinic.address && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {clinic.address}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border-none overflow-hidden">
          <CardHeader className="p-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Відгуки</h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Поки немає відгуків</p>
              </div>
            ) : (
              <div className="relative mb-8">
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(reviews.length / 3) }, (_, pageIndex) => (
                      <div key={pageIndex} className="flex-shrink-0 w-full flex gap-4">
                        {reviews.slice(pageIndex * 3, (pageIndex + 1) * 3).map(r => (
                          <div 
                            key={r.id} 
                            className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900">{r.user_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= r.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300 stroke-current fill-none'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">{new Date(r.created_at).toLocaleDateString('uk-UA')}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {Math.ceil(reviews.length / 3) > 1 && (
                  <>
                    <button
                      onClick={handlePrevReview}
                      disabled={currentReviewIndex === 0}
                      className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-md border border-gray-200 ${
                        currentReviewIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleNextReview}
                      disabled={currentReviewIndex >= Math.ceil(reviews.length / 3) - 1}
                      className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-md border border-gray-200 ${
                        currentReviewIndex >= Math.ceil(reviews.length / 3) - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            )}

            {isLoggedIn && doctor.can_leave_review && doctor.appointments?.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Залишити відгук</h4>
                <div className="space-y-4">
                  {reviewError && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">{reviewError}</AlertDescription>
                    </Alert>
                  )}
                  {reviewSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">{reviewSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Оберіть візит
                    </label>
                   <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                      value={selectedAppointment}
                      onChange={(e) => setSelectedAppointment(e.target.value)}
                    >
                      <option value="">Виберіть візит для відгуку</option>
                      {doctor.appointments?.map(a => (
                        <option key={a.id} value={a.id}>
                          {new Date(a.from).toLocaleDateString('uk-UA', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} – {new Date(a.to).toLocaleTimeString('uk-UA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваш відгук
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px] text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical bg-white"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Поділіться своїм досвідом відвідування..."
                      rows="4"
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.length}/1000 символів
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Оцінка
                    </label>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer transition-colors duration-200 hover:text-yellow-400 ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 stroke-current fill-none'
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                      {rating > 0 && (
                        <span className="text-sm text-gray-600 ml-2">
                          {rating} з 5 зірок
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleSubmitReview}
                      disabled={!selectedAppointment || !comment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Опублікувати відгук
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DoctorProfile