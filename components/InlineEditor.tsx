'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { updateEntry } from '@/app/actions/entries'
import { toast } from 'sonner'
import { Save, Loader2, Paperclip, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image'

export function InlineEditor({
  id,
  initialContent,
  initialImages = [],
  onCancel,
}: {
  id: string
  initialContent: string
  initialImages?: string[]
  onCancel: () => void
}) {
  const [content, setContent] = useState(initialContent)
  const [images, setImages] = useState<string[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const len = content.length
    ref.current?.setSelectionRange(len, len)
  }, [])

  // Auto-resize
  useEffect(() => {
    const ta = ref.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [content])

  const handleSave = () => {
    if (!content.trim()) return
    startTransition(async () => {
      try {
        await updateEntry(id, content.trim(), images)
        toast.success('Entry updated ✓')
        onCancel() // close editor
      } catch {
        toast.error('Failed to update entry')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') onCancel()
  }

  // Handle image upload and compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Sign in to upload images.')
      setIsUploading(false)
      return
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Compress client-side if exceeds 500KB
        const processedFile = await compressImage(file)
        
        // Unique filename
        const extension = processedFile.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop()
        const uniqueFilename = `${crypto.randomUUID()}.${extension}`
        const filePath = `${user.id}/${uniqueFilename}`

        // Upload to storage
        const { error } = await supabase.storage
          .from('journal-images')
          .upload(filePath, processedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('journal-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      } catch (err: any) {
        console.error(err)
        toast.error(`Upload failed for ${file.name}: ${err.message}`)
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls])
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Remove attached image
  const removeImage = (urlToRemove: string) => {
    setImages((prev) => prev.filter((url) => url !== urlToRemove))
  }

  return (
    <div className="space-y-4">
      <textarea
        ref={ref}
        id="inline-editor"
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10)
          }
        }}
        onKeyDown={handleKeyDown}
        className="rant-textarea"
        style={{ minHeight: '60px' }}
        disabled={isPending}
      />

      {/* Image Preview Grid */}
      {(images.length > 0 || isUploading) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group/img bg-secondary/30">
              <img
                src={url}
                alt="Attached image preview"
                className="w-full h-full object-cover transition duration-300 hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur-md rounded-md border border-border text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="relative aspect-square rounded-lg border border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center animate-pulse gap-1 text-[10px] text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Uploading…</span>
            </div>
          )}
        </div>
      )}

      {/* Footer / Actions */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isPending || isUploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || isUploading}
          className="flex items-center justify-center p-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition active:scale-95 disabled:opacity-40"
          title="Attach images"
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Paperclip className="size-3.5" />
          )}
        </button>

        <button
          id="save-edit-btn"
          onClick={handleSave}
          disabled={isPending || isUploading || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-40 transition shadow-sm"
        >
          {isPending
            ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
            : <><Save className="size-3.5" /> Save changes</>
          }
        </button>
        <button
          id="cancel-edit-btn"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-secondary"
        >
          Cancel
        </button>
        <span className="text-xs text-muted-foreground/60 ml-auto hidden sm:block">
          ⌘↵ to save · Esc to cancel
        </span>
      </div>
    </div>
  )
}
