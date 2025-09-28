import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { User, UserPlus, LogIn, LogOut, Stethoscope } from 'lucide-react'

const Header = ({ user, logout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Medical System</h1>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link to="/about">
              <Button variant="ghost">About Us</Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost">FAQ</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
           
          </nav>
          <div>
             {user ? (
              user.doctor ? (
                <Link to="/doctor/me">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </Button>
                </Link>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
                <Link to="/register-doctor">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Doctor Registration</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header