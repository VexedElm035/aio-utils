import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { PdfOutletContext } from './PdfView'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const PdfCompress = () => {
  const { pdfItems } = useOutletContext<PdfOutletContext>()
  const [preset, setPreset] = useState<'native' | 'quality' | 'balanced' | 'max'>('quality')
  const [downloadOption, setDownloadOption] = useState<'separate' | 'zip'>('separate')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const presetOptions = [
    { value: 'native' as const, label: 'Nativo', desc: 'Sin pérdida de calidad' },
    { value: 'quality' as const, label: 'Calidad', desc: 'Alta calidad' },
    { value: 'balanced' as const, label: 'Equilibrada', desc: 'Balance ideal' },
    { value: 'max' as const, label: 'Máxima', desc: 'Menor peso' },
  ];

  const handleCompress = async () => {
    if (pdfItems.length === 0) {
      setError('Selecciona al menos un PDF para comprimir.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const shouldZip = pdfItems.length > 1 && downloadOption === 'zip'

      if (shouldZip) {
        const formData = new FormData()
        pdfItems.forEach((item) => {
          formData.append('files', item.file)
        })
        formData.append('preset', preset)

        const response = await fetch(`${API_BASE_URL}/api/pdf/compress/batch`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'No se pudo comprimir los PDFs.')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = 'compressed-pdfs.zip'
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      } else {
        for (const item of pdfItems) {
          const formData = new FormData()
          formData.append('file', item.file)
          formData.append('preset', preset)

          const response = await fetch(`${API_BASE_URL}/api/pdf/compress`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'No se pudo comprimir el PDF.')
          }

          const blob = await response.blob()
          const originalName = item.file.name || 'documento.pdf'
          const downloadName = originalName.replace(/\.pdf$/i, '-compressed.pdf')
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')

          link.href = url
          link.download = downloadName
          document.body.appendChild(link)
          link.click()
          link.remove()
          URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='col-span-full flex flex-col gap-4 w-full'>
      <div className='retro-window p-4 flex flex-col items-center gap-4'>
        <h3 className='font-retro text-lg text-text'>Configuración de Compresión</h3>

        {/* Preset cards */}
        <div className='flex flex-wrap gap-3 justify-center w-full'>
          {presetOptions.map(({ value, label, desc }) => (
            <label
              key={value}
              htmlFor={`preset-${value}`}
              className={`retro-radio-card flex flex-col items-center justify-center
                w-28 h-20 md:w-34 md:h-24 cursor-pointer text-center p-2
                ${preset === value ? 'selected' : ''}`}
            >
              <span className="font-ui font-semibold text-sm text-text">{label}</span>
              <input
                id={`preset-${value}`}
                type='radio'
                name='compression-preset'
                value={value}
                className='hidden'
                checked={preset === value}
                onChange={() => setPreset(value)}
              />
              <p className='text-xs text-text-muted mt-1'>{desc}</p>
            </label>
          ))}
        </div>

        {/* Download option — only for multiple PDFs */}
        {pdfItems.length > 1 && (
          <div className='retro-inset p-3 flex flex-wrap items-center gap-3 text-sm font-ui'>
            <span className='text-text-muted'>Descarga:</span>
            <label className='flex items-center gap-1 cursor-pointer text-text'>
              <input
                type='radio'
                name='download-option'
                value='zip'
                checked={downloadOption === 'zip'}
                onChange={() => setDownloadOption('zip')}
                className='accent-accent'
              />
              ZIP
            </label>
            <label className='flex items-center gap-1 cursor-pointer text-text'>
              <input
                type='radio'
                name='download-option'
                value='separate'
                checked={downloadOption === 'separate'}
                onChange={() => setDownloadOption('separate')}
                className='accent-accent'
              />
              Por separado
            </label>
          </div>
        )}

        <button
          className='retro-btn-accent px-6 py-2'
          type='button'
          onClick={handleCompress}
          disabled={isLoading}
        >
          {isLoading ? 'Comprimiendo...' : 'Comprimir'}
        </button>

        {error && <p className='text-sm text-error font-ui'>{error}</p>}
      </div>
    </div>
  )
}

export default PdfCompress