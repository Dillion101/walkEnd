'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Edit2, Plus, GripVertical } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  order_index: number
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order_index: 0,
  })

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
      setFaqs(data || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingId) {
        // Update existing FAQ
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question,
            answer: formData.answer,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new FAQ
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order_index)) : -1

        const { error } = await supabase.from('faqs').insert({
          question: formData.question,
          answer: formData.answer,
          order_index: maxOrder + 1,
        })

        if (error) throw error
      }

      resetForm()
      setIsOpen(false)
      await fetchFAQs()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert(error instanceof Error ? error.message : 'Failed to save FAQ')
    }
  }

  async function deleteFAQ(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id)
      if (error) throw error
      await fetchFAQs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete FAQ')
    }
  }

  async function reorderFAQs(fromIndex: number, toIndex: number) {
    const newFaqs = [...faqs]
    const [movedFaq] = newFaqs.splice(fromIndex, 1)
    newFaqs.splice(toIndex, 0, movedFaq)

    // Update all order indices
    try {
      for (let i = 0; i < newFaqs.length; i++) {
        if (newFaqs[i].order_index !== i) {
          await supabase.from('faqs').update({ order_index: i }).eq('id', newFaqs[i].id)
        }
      }
      await fetchFAQs()
    } catch (error) {
      console.error('Error reordering FAQs:', error)
    }
  }

  function resetForm() {
    setFormData({
      question: '',
      answer: '',
      order_index: 0,
    })
    setEditingId(null)
  }

  function editFAQ(faq: FAQ) {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index,
    })
    setEditingId(faq.id)
    setIsOpen(true)
  }

  if (loading) {
    return <div>Loading FAQs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="WalkEnd WeekEnd Logo"
            width={40}
            height={40}
          />
          <div>
            <h2 className="text-3xl font-bold">FAQ Management</h2>
            <p className="text-muted-foreground">Add and manage frequently asked questions</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update FAQ details' : 'Add a new frequently asked question'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question *</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="What is WalkEnd WeekEnd?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Answer *</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a detailed answer..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingId ? 'Update FAQ' : 'Create FAQ'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No FAQs yet. Add your first question!</p>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq, index) => (
            <Card
              key={faq.id}
              draggable
              onDragStart={() => setDraggedId(faq.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const draggedIndex = faqs.findIndex((f) => f.id === draggedId)
                if (draggedIndex !== index && draggedIndex !== -1) {
                  reorderFAQs(draggedIndex, index)
                }
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <button className="text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editFAQ(faq)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteFAQ(faq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
