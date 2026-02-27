import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { PdfOutletContext } from './PdfView'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type ConvertTarget = 'docx' | 'png' | 'jpg'
type DownloadOption = 'zip' | 'separate'

const PdfConvert = () => {
  const { pdfItems } = useOutletContext<PdfOutletContext>()
  const [target, setTarget] = useState<ConvertTarget>('docx')
  const [downloadOption, setDownloadOption] = useState<DownloadOption>('zip')
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

  const handleConvert = async () => {
    if (pdfItems.length === 0) {
      setError('Selecciona al menos un PDF para convertir.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      for (const item of pdfItems) {
        if (target === 'docx') {
          const formData = new FormData()
          formData.append('file', item.file)

          const response = await fetch(`${API_BASE_URL}/api/pdf/convert/docx`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'No se pudo convertir el PDF a DOCX.')
          }

          const blob = await response.blob()
          const baseName = item.file.name.replace(/\.pdf$/i, '')
          downloadBlob(blob, `${baseName || 'documento'}.docx`)
          continue
        }

        if (downloadOption === 'zip') {
          const formData = new FormData()
          formData.append('file', item.file)
          formData.append('image_format', target)

          const response = await fetch(`${API_BASE_URL}/api/pdf/convert/images`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'No se pudo convertir el PDF a imagenes.')
          }

          const blob = await response.blob()
          const baseName = item.file.name.replace(/\.pdf$/i, '')
          downloadBlob(blob, `${baseName || 'documento'}-images.zip`)
          continue
        }

        const countForm = new FormData()
        countForm.append('file', item.file)

        const countResponse = await fetch(`${API_BASE_URL}/api/pdf/page-count`, {
          method: 'POST',
          body: countForm,
        })

        if (!countResponse.ok) {
          const message = await countResponse.text()
          throw new Error(message || 'No se pudo leer el numero de paginas.')
        }

        const countPayload = await countResponse.json()
        const pages = Number(countPayload.pages)

        if (!Number.isFinite(pages) || pages <= 0) {
          throw new Error('Numero de paginas invalido.')
        }

        for (let page = 1; page <= pages; page += 1) {
          const formData = new FormData()
          formData.append('file', item.file)
          formData.append('page', String(page))
          formData.append('image_format', target)

          const response = await fetch(`${API_BASE_URL}/api/pdf/convert/image`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'No se pudo convertir la pagina.')
          }

          const blob = await response.blob()
          const baseName = item.file.name.replace(/\.pdf$/i, '')
          const filename = `${baseName || 'documento'}-page-${String(page).padStart(3, '0')}.${target}`
          downloadBlob(blob, filename)
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
    <div className='col-span-2'>
      <div>
        <p>Convertir a:</p>

        <label htmlFor='convert-docx'>DOCX</label>
        <input
          id='convert-docx'
          type='radio'
          name='convert-target'
          value='docx'
          checked={target === 'docx'}
          onChange={() => setTarget('docx')}
        />

        <label htmlFor='convert-png'>PNG</label>
        <input
          id='convert-png'
          type='radio'
          name='convert-target'
          value='png'
          checked={target === 'png'}
          onChange={() => setTarget('png')}
        />

        <label htmlFor='convert-jpg'>JPG</label>
        <input
          id='convert-jpg'
          type='radio'
          name='convert-target'
          value='jpg'
          checked={target === 'jpg'}
          onChange={() => setTarget('jpg')}
        />
      </div>

      {target !== 'docx' && pdfItems.length > 0 && (
        <div>
          <p>Descarga:</p>
          <label htmlFor='download-zip'> ZIP </label>
          <input
            id='download-zip'
            type='radio'
            name='download-option'
            value='zip'
            checked={downloadOption === 'zip'}
            onChange={() => setDownloadOption('zip')}
          />
          <label htmlFor='download-separate'> Por separado</label>
          <input
            id='download-separate'
            type='radio'
            name='download-option'
            value='separate'
            checked={downloadOption === 'separate'}
            onChange={() => setDownloadOption('separate')}
          />
        </div>
      )}

      <button type='button' onClick={handleConvert} disabled={isLoading}>
        {isLoading ? 'Convirtiendo...' : 'Convertir'}
      </button>

      {error && <p>{error}</p>}
    </div>
  )
}

export default PdfConvert