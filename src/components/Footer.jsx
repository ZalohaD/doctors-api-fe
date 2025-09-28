import { Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Stethoscope className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Medical System</span>
            </Link>
            <p className="text-gray-400">
              Connecting patients and doctors for better healthcare.
            </p>
          </div>
          
          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white">Register</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400">Email: support@medicalsystem.com</p>
            <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
            <p className="text-gray-400">Address: 123 Health St, Medical City</p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Medical System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer