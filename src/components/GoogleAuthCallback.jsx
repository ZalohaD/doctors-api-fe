import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GoogleAuthCallback = ({ setUser }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const userParam = urlParams.get('user')

    if (token && userParam) {
      const userData = JSON.parse(decodeURIComponent(userParam))
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser({ token, ...userData })
      navigate('/')  // редирект на головну
    } else {
      navigate('/login')
    }
  }, [navigate, setUser])

  return <div>Logging in...</div>
}

export default GoogleAuthCallback