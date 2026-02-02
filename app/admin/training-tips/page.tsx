'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { uploadToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary'

interface TrainingTip {
  id: string
  title: string
  content: string
  category: string
  image_url: string
  created_at: string
}

const CATEGORIES = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Nutrition',
  'Injuries',
  'Motivation',
  'Gear',
]

export default function TrainingTipsPage() {
  const { user } = useAuth()
  const [tips, setTips] = useState<TrainingTip[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Beginner',
    image_url: '',
  })

  useEffect(() => {
    fetchTips()
  }, [])

  async function fetchTips() {
    try {
      const { data, error } = await supabase
        .from('training_tips')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTips(data || [])
    } catch (error) {
      console.error('Error fetching training tips:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) {
      alert('You must be logged in')
      return
    }

    setUploading(true)

    try {
      let imageUrl = formData.image_url

      // Upload image if selected
      if (imageFile) {
        const { url } = await uploadToCloudinary(imageFile)
        imageUrl = url
      }

      if (editingId) {
        // Update existing tip
        const { error } = await supabase
          .from('training_tips')
          .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            image_url: imageUrl,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new tip
        const { error } = await supabase.from('training_tips').insert({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          image_url: imageUrl,
          author_id: user.id,
        })

        if (error) throw error
      }

      resetForm()
      setIsOpen(false)
      await fetchTips()
    } catch (error) {
      console.error('Error saving training tip:', error)
      alert(error instanceof Error ? error.message : 'Failed to save training tip')
    } finally {
      setUploading(false)
    }
  }

  async function deleteTip(id: string) {
    if (!confirm('Are you sure you want to delete this training tip?')) return

    try {
      // Find tip to get image URL
      const tip = tips.find(t => t.id === id)
      if (tip && tip.image_url) {
        await deleteImageFromCloudinary(tip.image_url)
      }

      const { error } = await supabase.from('training_tips').delete().eq('id', id)
      if (error) throw error
      await fetchTips()
    } catch (error) {
      console.error('Error deleting training tip:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete training tip')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      category: 'Beginner',
      image_url: '',
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
  }

  function editTip(tip: TrainingTip) {
    setFormData({
      title: tip.title,
      content: tip.content,
      category: tip.category,
      image_url: tip.image_url,
    })
    setImagePreview(tip.image_url)
    setEditingId(tip.id)
    setIsOpen(true)
  }

  const filteredTips = filterCategory ? tips.filter((tip) => tip.category === filterCategory) : tips

  if (loading) {
    return <div>Loading training tips...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="WalkEnd WeekEnd Logo"
            width={40}
            height={40}
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Training Tips Management</h2>
            <p className="text-muted-foreground text-sm">Share running and training advice</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Tip
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Training Tip' : 'Create New Training Tip'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update training tip details' : 'Add a new training tip'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="How to improve your running pace"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed training tip content..."
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  aria-label="Select a category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded bg-background"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cover Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={uploading}>
                  {uploading ? 'Saving...' : editingId ? 'Update Tip' : 'Create Tip'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterCategory === '' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('')}
          className={filterCategory === '' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          All ({tips.length})
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'outline'}
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {cat} ({tips.filter((t) => t.category === cat).length})
          </Button>
        ))}
      </div>

      {/* Training Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {filterCategory ? 'No tips in this category.' : 'No training tips yet. Add your first tip!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTips.map((tip) => (
            <Card key={tip.id}>
              <CardContent className="pt-4">
                {tip.image_url && (
                  <img
                    src={tip.image_url}
                    alt={tip.title}
                    className="w-full h-40 rounded object-cover mb-3"
                  />
                )}
                <div className="mb-3">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    {tip.category}
                  </span>
                </div>
                <h3 className="font-bold mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{tip.content}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editTip(tip)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTip(tip.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
