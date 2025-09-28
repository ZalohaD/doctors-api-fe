import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const HeroSearch = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Знайдіть свого лікаря
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Професійні лікарі різних спеціальностей готові допомогти вам
        </p>

        {/* Search */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Пошук за ім'ям або спеціальністю..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>
    </div>
  )
}

export default HeroSearch
