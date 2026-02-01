'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppLink() {
  const phoneNumber = '233501234567' // Replace with your WhatsApp number
  const message = 'Hi! I\'m interested in ordering from WalkEnd WeekEnd. Please tell me about available items and pricing.'

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-3 w-full bg-accent text-background px-8 py-4 text-lg font-semibold uppercase tracking-wider hover:bg-accent/90 transition-all duration-300 hover:shadow-lg"
    >
      <MessageCircle size={24} />
      <span>Message on WhatsApp</span>
    </a>
  )
}
