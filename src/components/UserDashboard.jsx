import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Calendar, LogOut } from 'lucide-react'
import { API_BASE_URL } from '@/core/constants'

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState(null)
  
  // Form states for profile
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: ''
  })

  // State for appointments
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUser(), fetchAppointments()])
      setLoading(false)
    }
    loadData()
  }, [])

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authentication token found')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.debug) setDebug(data.debug)
        setError(data.message || 'Error loading user data')
        setLoading(false)
        return
      }

      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))

      setProfileData({
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || ''
      })
    } catch (err) {
      setError('Server connection error')
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authentication token found')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error loading appointments')
        return
      }

      setAppointments(data)
    } catch (err) {
      setError('Server connection error')
    }
  }

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('No authentication token found')

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profileData)
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.debug) setDebug(data.debug)
        return alert(data.message || 'Error updating profile')
      }

      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      alert('Profile updated successfully!')
    } catch (err) {
      alert('Server connection error')
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      localStorage.removeItem('user')
      window.location.href = '/login'
      return
    }

    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar }
  ]

  if (loading) return <div className="text-center py-12">Loading...</div>

  if (error) return (
    <Alert variant="destructive" className="space-y-2">
      <AlertDescription>{error}</AlertDescription>
      {debug && (
        <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(debug, null, 2)}
        </pre>
      )}
    </Alert>
  )

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 mb-6 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 mb-4">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="User Avatar"
                  className="h-20 w-20 rounded-full object-cover border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="h-10 w-10" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Avatar URL</label>
                <Input
                  value={profileData.avatar}
                  onChange={e => setProfileData({...profileData, avatar: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={profileData.name} 
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  value={profileData.email} 
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'appointments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.length > 0 ? (
              appointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor_name || 'Doctor Appointment'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.date} at {appointment.time}
                    </p>
                    {appointment.clinic && (
                      <p className="text-sm text-gray-600">
                        Clinic: {appointment.clinic.name}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">You have no upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UserDashboard
