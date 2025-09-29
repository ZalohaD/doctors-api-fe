import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Components
import Header from './components/Header'
import Home from './components/Home'
import UserRegister from './components/UserRegister'
import DoctorRegister from './components/DoctorRegister'
import Login from './components/Login'
import DoctorLogin from './components/DoctorLogin'
import DoctorProfile from './components/DoctorProfile'
import DoctorDashboard from './components/DoctorDashboard'
import SearchResults from './components/SearchResults'
import UserDashboard from './components/UserDashboard'
import Footer from './components/Footer'
import AboutUs from './components/AboutUs'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import GoogleAuthCallback from './components/GoogleAuthCallback'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  // Check if user is logged in
  const token = localStorage.getItem('token')
  const doctorData = localStorage.getItem('doctor')
  
  if (token) {
    const user = { token }
    
    // Якщо є збережені дані лікаря, додаємо їх
    if (doctorData) {
      try {
        user.doctor = JSON.parse(doctorData)
      } catch (error) {
        console.error('Error parsing doctor data:', error)
        localStorage.removeItem('doctor')
      }
    }
    
    setUser(user)
  }
  setLoading(false)
}, [])
   const token = localStorage.getItem('token');

// Також оновіть функцію logout
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('doctor') // Видаляємо і дані лікаря
  setUser(null)
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <Router>
  <div className="min-h-screen bg-gray-50">
    <Header user={user} logout={logout} />
    <main className="container mx-auto px-4 py-8">
      <Routes>
        <Route 
          path="/auth/callback" 
          element={<GoogleAuthCallback setUser={setUser} />} 
        />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/dashboard" element={<UserDashboard />} /> 
        <Route path="/register-doctor" element={<DoctorRegister />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/login-doctor" element={<DoctorLogin setUser={setUser} />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/doctor/me" element={<DoctorDashboard />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/about" element={<AboutUs/>} />
        <Route path="/faq" element={<FAQ/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </div>
</Router>

  )
}

export default App

