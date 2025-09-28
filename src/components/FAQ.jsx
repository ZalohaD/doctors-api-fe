import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "To book an appointment, log in to your account, navigate to the dashboard, and select a doctor and available time slot. You can also search for doctors by specialization or location."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule appointments directly from your dashboard under the 'Appointments' tab. Please note that some clinics may have specific cancellation policies."
    },
    {
      question: "How do I register as a doctor?",
      answer: "Doctors can register by clicking the 'Doctor Registration' link in the header. You'll need to provide your professional credentials and clinic information for verification."
    },
    {
      question: "Is my personal information secure?",
      answer: "We prioritize your privacy and use industry-standard encryption to protect your personal and medical information. Please see our Privacy Policy for more details."
    },
    {
      question: "What should I do if I encounter an issue with the platform?",
      answer: "If you experience any issues, please contact our support team via the Contact page or email us at support@medicalsystem.com. We're here to help!"
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b py-4">
              <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default FAQ