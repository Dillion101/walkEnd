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
import { uploadToCloudinary } from '@/lib/cloudinary'

interface Merchandise {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  image_public_id: string
  created_at: string
}

export default function MerchandisePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Merchandise[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
  })

  useEffect(() => {
    fetchMerchandise()
  }, [])

  async function fetchMerchandise() {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching merchandise:', error)
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
      let imagePublicId = ''

      // Upload image if selected
      if (imageFile) {
        const { url, publicId } = await uploadToCloudinary(imageFile)
        imageUrl = url
        imagePublicId = publicId
      }

      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('merchandise')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: imageUrl,
            ...(imagePublicId && { image_public_id: imagePublicId }),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase.from('merchandise').insert({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          image_url: imageUrl,
          image_public_id: imagePublicId,
          created_by: user.id,
        })

        if (error) throw error
      }

      resetForm()
      setIsOpen(false)
      await fetchMerchandise()
    } catch (error) {
      console.error('Error saving merchandise:', error)
      alert(error instanceof Error ? error.message : 'Failed to save merchandise')
    } finally {
      setUploading(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase.from('merchandise').delete().eq('id', id)
      if (error) throw error
      await fetchMerchandise()
    } catch (error) {
      console.error('Error deleting merchandise:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete item')
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
  }

  function editItem(item: Merchandise) {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
    })
    setImagePreview(item.image_url)
    setEditingId(item.id)
    setIsOpen(true)
  }

  if (loading) {
    return <div>Loading merchandise...</div>
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
            <h2 className="text-3xl font-bold">Merchandise Management</h2>
            <p className="text-muted-foreground">Add and manage merchandise items</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Merchandise' : 'Create New Merchandise'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update merchandise details' : 'Add a new merchandise item'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="T-Shirt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item details..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="29.99"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
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
                  {uploading ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Merchandise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No merchandise items yet. Add your first item!</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-40 rounded object-cover mb-3"
                  />
                )}
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <p className="text-lg font-bold text-orange-500 mb-3">${item.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editItem(item)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
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
