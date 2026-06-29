/**
 * Client-side image compression using HTML5 Canvas.
 * If file size is larger than 500KB, it compresses it down.
 */
export async function compressImage(file: File): Promise<File | Blob> {
  const MAX_SIZE_BYTES = 500 * 1024 // 500 KB
  
  if (file.type === 'image/gif') {
    return file // Do not compress GIFs to preserve animation
  }

  if (file.size <= MAX_SIZE_BYTES) {
    return file // Return unchanged if already under 500KB
  }

  console.log(`Compressing ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Max dimension bounds (e.g. 1600px)
        const MAX_DIMENSION = 1600
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width = MAX_DIMENSION
          } else {
            width = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file) // Fallback if 2d context fails
          return
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Compress to JPEG with 0.8 quality (highly effective compression)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Convert blob to a file preserving original name
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              console.log(`Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`)
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback
            }
          },
          'image/jpeg',
          0.8
        )
      }

      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
