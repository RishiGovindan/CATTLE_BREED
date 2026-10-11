import { useCallback, useRef, useState } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 // 8MB

export default function ImageUploader({ onFileSelected, previewUrl, onClear, disabled }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0]
      if (!file) return

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Unsupported file type. Please upload a JPG, PNG, or WEBP image.')
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError('That image is too large. Please upload a photo under 8MB.')
        return
      }

      setError('')
      onFileSelected(file)
    },
    [onFileSelected],
  )

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleFiles(event.dataTransfer.files)
  }

  function handleDragOver(event) {
    event.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleClear() {
    setError('')
    onClear()
  }

  if (previewUrl) {
    return (
      <div className="uploader-preview">
        <img src={previewUrl} alt="Uploaded animal preview" className="uploader-preview-image" />
        <button type="button" className="uploader-remove" onClick={handleClear} disabled={disabled}>
          Remove / Change Image
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`uploader-dropzone${isDragging ? ' is-dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload an animal image"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files)
            // allow re-selecting the same file after an error/clear
            event.target.value = ''
          }}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V4M12 4L7 9M12 4l5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="uploader-title">Drag &amp; drop an image, or click to upload</p>
        <p className="uploader-subtitle">JPG, PNG, or WEBP — a clear side-on photo works best (max 8MB)</p>
      </div>
      {error && (
        <p className="uploader-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
