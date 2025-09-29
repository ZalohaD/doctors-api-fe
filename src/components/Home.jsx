import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, MapPin, Phone, Mail, Search, User, Home as HomeIcon } from 'lucide-react'
import HeroSearch from './HeroSearch'
import { API_BASE_URL } from '@/core/constants'

const Home = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, _setSearchTerm] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        setError('Помилка завантаження списку лікарів')
      }
    } catch (error) {
      setError('Помилка з\'єднання з сервером')
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.first_name ?? ''} ${doctor.last_name ?? ''}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (doctor.specializations && doctor.specializations.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Завантаження лікарів...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
     
          
                <HeroSearch />
  
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {doctor.first_name} {doctor.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Лікар
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Specializations */}
                {doctor.specializations && doctor.specializations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Спеціалізації:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {doctor.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{doctor.specializations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {doctor.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {doctor.phone}
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {doctor.email}
                    </div>
                  )}
                  {doctor.address && (
                    <div className="flex items-center">
                      <HomeIcon className="h-4 w-4 mr-2" />
                      {doctor.address}
                    </div>
                  )}
                  {doctor.clinics && doctor.clinics.length > 0 && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {doctor.clinics[0].name}
                      {doctor.clinics.length > 1 && ` +${doctor.clinics.length - 1}`}
                    </div>
                  )}
                </div>
                          {/* Available Time */}
                {doctor.available_time && doctor.available_time.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">Доступний час:</p>
                    <ul className="space-y-1">
                      {doctor.available_time?.[0]?.map((slot, index) => (
                        <li key={index}>
                          {slot.day}: {slot.from} – {slot.to}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* View Profile Button */}
                <Link to={`/doctor/${doctor.id}`} className="block">
                  <Button className="w-full mt-4">
                    Переглянути профіль
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Лікарів не знайдено' : 'Лікарі відсутні'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Спробуйте змінити критерії пошуку' 
                : 'Наразі в системі немає зареєстрованих лікарів'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
