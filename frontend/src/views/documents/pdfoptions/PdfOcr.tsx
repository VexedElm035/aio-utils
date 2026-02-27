import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { PdfOutletContext } from './PdfView'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type OcrMode = 'apply' | 'remove'

const PdfOcr = () => {
  const { pdfItems } = useOutletContext<PdfOutletContext>()
  const [mode, setMode] = useState<OcrMode>('apply')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleOcr = async () => {
    if (pdfItems.length === 0) {
      setError('Selecciona al menos un PDF.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const endpoint = mode === 'apply' ? 'ocr/apply' : 'ocr/remove'
      const suffix = mode === 'apply' ? '-ocr.pdf' : '-no-ocr.pdf'

      for (const item of pdfItems) {
        const formData = new FormData()
        formData.append('file', item.file)

        const response = await fetch(`${API_BASE_URL}/api/pdf/${endpoint}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'No se pudo procesar el PDF.')
        }

        const blob = await response.blob()
        const baseName = item.file.name.replace(/\.pdf$/i, '') || 'documento'
        downloadBlob(blob, `${baseName}${suffix}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='col-span-full w-full'>
      <div className='retro-window p-4 flex flex-col gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='text-sm font-ui text-text-muted'>OCR:</span>
          <label
            className={`retro-radio-card px-4 py-2 text-sm font-ui cursor-pointer text-text
              ${mode === 'apply' ? 'selected' : ''}`}
          >
            Texto seleccionable
            <input
              type='radio'
              name='ocr-mode'
              value='apply'
              className='hidden'
              checked={mode === 'apply'}
              onChange={() => setMode('apply')}
            />
          </label>
          <label
            className={`retro-radio-card px-4 py-2 text-sm font-ui cursor-pointer text-text
              ${mode === 'remove' ? 'selected' : ''}`}
          >
            Quitar OCR
            <input
              type='radio'
              name='ocr-mode'
              value='remove'
              className='hidden'
              checked={mode === 'remove'}
              onChange={() => setMode('remove')}
            />
          </label>
        </div>

        <button
          className='retro-btn-accent px-6 py-2 self-center'
          type='button'
          onClick={handleOcr}
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Aplicar'}
        </button>

        {error && <p className='text-sm text-error font-ui'>{error}</p>}
      </div>
    </div>
  )
}

export default PdfOcr