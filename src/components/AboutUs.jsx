import { Link } from 'react-router-dom'

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">About Us</h1>
      
      {/* Mission Statement */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          At Medical System, we are dedicated to providing accessible and high-quality healthcare services. 
          Our platform connects patients with trusted doctors, streamlining appointment scheduling and 
          medical care management to improve your health journey.
        </p>
      </section>

      {/* Team Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Team Member 1 */}
          <div className="text-center">
            <img 
              src="https://via.placeholder.com/300x300?text=Team+Member+1" 
              alt="Team Member 1" 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-medium">Dr. John Doe</h3>
            <p className="text-gray-500">Chief Medical Officer</p>
          </div>
          {/* Team Member 2 */}
          <div className="text-center">
            <img 
              src="https://via.placeholder.com/300x300?text=Team+Member+2" 
              alt="Team Member 2" 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-medium">Jane Smith</h3>
            <p className="text-gray-500">Lead Developer</p>
          </div>
          {/* Team Member 3 */}
          <div className="text-center">
            <img 
              src="https://via.placeholder.com/300x300?text=Team+Member+3" 
              alt="Team Member 3" 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-medium">Dr. Emily Brown</h3>
            <p className="text-gray-500">Head of Patient Care</p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium">Compassion</h3>
            <p className="text-gray-600">We prioritize patient well-being and empathy in all our services.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium">Innovation</h3>
            <p className="text-gray-600">Leveraging technology to make healthcare more efficient and accessible.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium">Trust</h3>
            <p className="text-gray-600">Building reliable connections between patients and healthcare providers.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium">Excellence</h3>
            <p className="text-gray-600">Striving for the highest standards in medical care and service delivery.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs