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
import { Trash2, Edit2, Plus, Eye, EyeOff } from 'lucide-react'
import { uploadToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_url: string
  published: boolean
  created_at: string
}

export default function BlogPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    published: false,
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
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
      let imageUrl = formData.featured_image_url

      // Upload image if selected
      if (imageFile) {
        const { url } = await uploadToCloudinary(imageFile)
        imageUrl = url
      }

      if (editingId) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            featured_image_url: imageUrl,
            published: formData.published,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase.from('blog_posts').insert({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          featured_image_url: imageUrl,
          published: formData.published,
          author_id: user.id,
        })

        if (error) throw error

        // Send blog notification email if published
        if (formData.published) {
          try {
            const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://walkendweekend.com'}/blog/${formData.slug}`
            const response = await fetch('/api/emails/send-blog-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                postTitle: formData.title,
                postExcerpt: formData.excerpt,
                postUrl: postUrl,
                featuredImageUrl: imageUrl,
              }),
            })

            if (!response.ok) {
              console.error('Failed to send blog notifications')
            }
          } catch (emailError) {
            console.error('Error sending blog notifications:', emailError)
            // Don't fail the post creation if email fails
          }
        }
      }

      resetForm()
      setIsOpen(false)
      await fetchPosts()
    } catch (error) {
      console.error('Error saving post:', error)
      alert(error instanceof Error ? error.message : 'Failed to save post')
    } finally {
      setUploading(false)
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete post')
    }
  }

  async function togglePublished(post: BlogPost) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id)

      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to update post')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      published: false,
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
  }

  function editPost(post: BlogPost) {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image_url: post.featured_image_url,
      published: post.published,
    })
    setImagePreview(post.featured_image_url)
    setEditingId(post.id)
    setIsOpen(true)
  }

  if (loading) {
    return <div>Loading blog posts...</div>
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
            <h2 className="text-2xl sm:text-3xl font-bold">Blog Management</h2>
            <p className="text-muted-foreground text-sm">Create and publish blog posts</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update blog post details' : 'Write a new blog post'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setFormData({ ...formData, title, slug: generateSlug(title) })
                  }}
                  placeholder="Blog post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug (Auto-generated) *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="blog-post-slug"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Excerpt *</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short summary of the post"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full blog post content"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Featured Image</label>
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={uploading}>
                  {uploading ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No blog posts yet. Write your first post!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-24 h-24 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{post.title}</h3>
                      {post.published ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Published</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">/{post.slug}</p>
                    <p className="text-sm mb-3">{post.excerpt}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(post)}
                    >
                      {post.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editPost(post)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost(post.id)}
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
