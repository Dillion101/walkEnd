'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'

interface FAQ {
  id: string
  question: string
  answer: string
  order_index: number
}

export default function FAQPage() {
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFAQs()
  }, [])

  async function fetchFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setFAQs(data || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black pt-20 py-12">
          <div className="flex items-center justify-center">
            <div className="text-white text-lg">Loading FAQs...</div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <img src="/icon.svg" alt="Logo" className="h-16 w-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Frequently Asked Questions</h1>
              <p className="text-lg text-gray-400">
                Find answers to common questions about our runs and community
              </p>
            </div>

            {/* Search */}
            <div>
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            {/* FAQs */}
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {searchTerm ? 'No matching questions found.' : 'No FAQs available yet.'}
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border-gray-800">
                    <AccordionTrigger className="text-left text-white hover:text-orange-500 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-gray-300">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* CTA */}
            <Card className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 text-center mt-12">
              <p className="text-gray-300">
                Didn't find your answer? <a href="mailto:contact@walkendweekend.com" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">Contact us</a>
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
