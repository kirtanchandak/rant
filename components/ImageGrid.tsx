'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

type ImageItem = {
  url: string
  entryId: string
  entryDate: string
  entrySnippet: string
}

function Lightbox({ img, onClose }: { img: ImageItem; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const el = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col gap-3 w-full max-w-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '-2.5rem', right: 0 }}
          className="p-1.5 text-white/60 hover:text-white transition"
        >
          <X className="size-5" />
        </button>

        {/* Image — maintains original aspect ratio, never goes out of viewport */}
        <img
          src={img.url}
          alt={img.entrySnippet}
          className="w-full max-h-[78dvh] object-contain rounded-xl shadow-2xl"
        />

        {/* Footer */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm gap-4">
          <p className="text-white/60 line-clamp-1 flex-grow text-xs">{img.entrySnippet}</p>
          <Link
            href={`/entries/${img.entryId}`}
            className="shrink-0 text-xs text-white/50 hover:text-white transition underline underline-offset-2"
            onClick={onClose}
          >
            View entry →
          </Link>
        </div>
      </div>
    </div>
  )

  // Render outside the constrained max-w-2xl layout via portal
  return createPortal(el, document.body)
}

export function ImageGrid({ images }: { images: ImageItem[] }) {
  const [lightbox, setLightbox] = useState<ImageItem | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      {/* Uniform 1:1 grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div
            key={`${img.entryId}-${idx}`}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-muted aspect-square"
            onClick={() => setLightbox(img)}
          >
            <img
              src={img.url}
              alt={img.entrySnippet}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
              <p className="text-white text-[11px] line-clamp-2 leading-snug font-medium">
                {img.entrySnippet}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Portal lightbox — renders directly on body, outside max-w-2xl constraint */}
      {mounted && lightbox && (
        <Lightbox img={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  )
}
