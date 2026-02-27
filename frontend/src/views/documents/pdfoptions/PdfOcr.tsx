import React, { useState } from 'react'
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
    <div>
      <div>
        <p>OCR:</p>
        <label htmlFor='ocr-apply'>Convertir a texto seleccionable</label>
        <input
          id='ocr-apply'
          type='radio'
          name='ocr-mode'
          value='apply'
          checked={mode === 'apply'}
          onChange={() => setMode('apply')}
        />

        <label htmlFor='ocr-remove'>Quitar OCR</label>
        <input
          id='ocr-remove'
          type='radio'
          name='ocr-mode'
          value='remove'
          checked={mode === 'remove'}
          onChange={() => setMode('remove')}
        />
      </div>

      <button type='button' onClick={handleOcr} disabled={isLoading}>
        {isLoading ? 'Procesando...' : 'Aplicar'}
      </button>

      {error && <p>{error}</p>}
    </div>
  )
}

export default PdfOcr