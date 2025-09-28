// src/pages/SearchResults.jsx
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Stethoscope, MapPin, Phone, Mail, User } from "lucide-react"

export default function SearchResults() {
  const location = useLocation()
  const query = new URLSearchParams(location.search).get("query") || ""

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (query.trim()) {
      fetchDoctors(query)
    }
  }, [query])

  const fetchDoctors = async (searchTerm) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/search?search=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        setError("Помилка пошуку лікарів")
      }
    } catch (err) {
      setError("Помилка з'єднання з сервером")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-lg">Завантаження результатів...</div>
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Результати пошуку: <span className="text-blue-600">{query}</span>
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
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
                {/* Спеціалізації */}
                {doctor.specializations && doctor.specializations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Спеціалізації:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Контакти */}
                <div className="space-y-2 text-sm text-gray-600">
                  {doctor.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> {doctor.phone}
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> {doctor.email}
                    </div>
                  )}
                  {doctor.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" /> {doctor.address}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Лікарів не знайдено</h3>
          <p className="text-gray-600">Спробуйте змінити критерії пошуку</p>
        </div>
      )}
    </div>
  )
}
