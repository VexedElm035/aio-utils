import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { PdfOutletContext } from './PdfView'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const PdfCompress = () => {
  const { pdfItems } = useOutletContext<PdfOutletContext>()
  const [preset, setPreset] = useState<'native' | 'quality' | 'balanced' | 'max'>('quality')
  const [downloadOption, setDownloadOption] = useState<'separate' | 'zip'>('separate')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className='col-span-2 flex flex-col gap-4 w-full h-full'>
      <div className='bg-red-500 w-full h-full flex flex-col items-center justify-center'>
        <h3 className='text-lg font-semibold'>Configuracion de Compresion:</h3>
        <div className='bg-blue-300 flex flex-row w-full gap-4 p-4 justify-center'>

          <label 
            htmlFor='preset-native'
            className={`bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2 ${preset === 'native' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
          >
            <span className="font-semibold">Nativo</span>
            <input
              id='preset-native'
              type='radio'
              name='compression-preset'
              value='native'
              className='hidden'
              checked={preset === 'native'}
              onChange={() => setPreset('native')}
            />
            <p className='text-xs mt-1'>Sin perdida de calidad</p>
          </label>

          <label 
            htmlFor='preset-quality'
            className={`bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2 ${preset === 'quality' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
          >
            <span className="font-semibold">Calidad</span>
            <input
              id='preset-quality'
              type='radio'
              name='compression-preset'
              value='quality'
              className='hidden'
              checked={preset === 'quality'}
              onChange={() => setPreset('quality')}
            />
            <p className='text-xs mt-1'>Alta calidad</p>
          </label>

          <label 
            htmlFor='preset-balanced'
            className={`bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2 ${preset === 'balanced' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
          >
            <span className="font-semibold">Equilibrada</span>
            <input
              id='preset-balanced'
              type='radio'
              name='compression-preset'
              value='balanced'
              className='hidden'
              checked={preset === 'balanced'}
              onChange={() => setPreset('balanced')}
            />
            <p className='text-xs mt-1'>Balance ideal</p>
          </label>

          <label 
            htmlFor='preset-max'
            className={`bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2 ${preset === 'max' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
          >
            <span className="font-semibold">Máxima</span>
            <input
              id='preset-max'
              type='radio'
              name='compression-preset'
              value='max'
              className='hidden'
              checked={preset === 'max'}
              onChange={() => setPreset('max')}
            />
            <p className='text-xs mt-1'>Menor peso</p>
          </label>
        </div>

          {pdfItems.length > 1 && (
            <>
              <p>opciones solo visible si se detectan mas de 1 pdf:</p>
              <label htmlFor='download-zip'> Descargar comprimidos en ZIP </label>
              <input
                id='download-zip'
                type='radio'
                name='download-option'
                value='zip'
                checked={downloadOption === 'zip'}
                onChange={() => setDownloadOption('zip')}
              />
              <label htmlFor='download-separate'> Descargar por separado</label>
              <input
                id='download-separate'
                type='radio'
                name='download-option'
                value='separate'
                checked={downloadOption === 'separate'}
                onChange={() => setDownloadOption('separate')}
              />
            </>
          )}

        
        <button
          className=''
          type='button'
          onClick={handleCompress}
          disabled={isLoading}
        >
          {isLoading ? 'Comprimiendo...' : 'Comprimir'}
        </button>

        {error && <p className='text-sm text-red-600'>{error}</p>}
      </div>
    </div>
  )
}

export default PdfCompress