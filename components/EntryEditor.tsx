'use client'

import { useState, useRef, useEffect, useCallback, useTransition } from 'react'
import { createEntry } from '@/app/actions/entries'
import { toast } from 'sonner'
import { Save, Loader2, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image'

export function EntryEditor({ greeting }: { greeting: string }) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastSavedRef = useRef('')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(ta.scrollHeight, 120)}px`
  }, [content])

  const handleSave = useCallback(
    (text: string, currentImages: string[]) => {
      if (!text.trim() || isPending) return
      
      startTransition(async () => {
        try {
          await createEntry(text.trim(), currentImages)
          lastSavedRef.current = text
          setContent('')
          setImages([]) // clear images on successful save
          if (textareaRef.current) {
            textareaRef.current.style.height = '120px'
          }
          toast.success('Entry saved ✓')
        } catch {
          toast.error('Failed to save. Try again.')
        }
      })
    },
    [isPending]
  )

  // Autosave after 5s of inactivity
  useEffect(() => {
    if (!content.trim() || content === lastSavedRef.current) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      // Autosave captures whatever images are attached at that moment
      handleSave(content, images)
    }, 5000)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [content, images, handleSave])

  // Cmd/Ctrl + Enter to save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave(content, images)
    }
  }

  // Handle image upload and compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit check: total images cannot exceed 5
    if (images.length + files.length > 5) {
      toast.error('You can only attach up to 5 images per entry.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

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

      // Limit check: individual file size cannot exceed 5MB
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is larger than 5MB and was skipped.`)
        continue
      }

      try {
        // Compress image client-side if it exceeds 500KB
        const processedFile = await compressImage(file)
        
        // Generate a random unique filename
        const extension = processedFile.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop()
        const uniqueFilename = `${crypto.randomUUID()}.${extension}`
        const filePath = `${user.id}/${uniqueFilename}`

        // Upload directly to Supabase storage
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

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground mt-1 text-sm">What's on your mind today?</p>
      </div>

      {/* Editor area */}
      <div className="relative group">
        <textarea
          ref={textareaRef}
          id="entry-editor"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(10) 
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start writing…"
          className="rant-textarea"
          style={{ minHeight: '120px' }}
          aria-label="Journal entry"
          disabled={isPending}
        />
        {/* Subtle animated bottom line */}
        <div
          className="absolute bottom-0 left-0 h-px w-full transition-all duration-500"
          style={{
            background: content
              ? 'linear-gradient(to right, oklch(0.28 0.018 55 / 45%), oklch(0.28 0.018 55 / 5%))'
              : 'var(--border)',
          }}
        />
      </div>

      {/* Image Preview Grid */}
      {(images.length > 0 || isUploading) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 animate-fade-in">
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

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Paperclip className="size-4" />
            )}
          </button>
          
          <span className="text-xs text-muted-foreground/70 tabular-nums">
            {content.trim()
              ? `${wordCount} word${wordCount === 1 ? '' : 's'} · ⌘↵ to save`
              : 'Start writing to save'}
          </span>
        </div>

        <button
          id="save-entry-btn"
          onClick={() => handleSave(content, images)}
          disabled={isPending || isUploading || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending
            ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
            : <><Save className="size-3.5" /> Save</>
          }
        </button>
      </div>
    </div>
  )
}
