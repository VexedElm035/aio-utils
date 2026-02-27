import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PiUploadSimpleBold, PiFilesBold, PiXBold } from "react-icons/pi";
import PdfCarousel from '../../../components/PdfCarousel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export type PdfItem = {
  id: string
  file: File
  previewUrl: string | null
  isPreviewLoading: boolean
  previewError: string | null
}

export type PdfOutletContext = {
  pdfItems: PdfItem[]
}

const PdfView = () => {
  const [pdfItems, setPdfItems] = useState<PdfItem[]>([])
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

  const [dropError, setDropError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef<PdfItem[]>([])

  const generateId = useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }, [])

  const requestPreview = useCallback(async (item: PdfItem) => {
    try {
      const formData = new FormData()
      formData.append('file', item.file)

      const response = await fetch(`${API_BASE_URL}/api/pdf/preview`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'No se pudo generar la vista previa.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      setPdfItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, previewUrl: url, isPreviewLoading: false, previewError: null }
            : current
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado.'
      setPdfItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, previewUrl: null, isPreviewLoading: false, previewError: message }
            : current
        )
      )
    }
  }, [])

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const pdfFiles = Array.from(files).filter((file) =>
        file.type ? file.type === 'application/pdf' : file.name.toLowerCase().endsWith('.pdf')
      )

      if (pdfFiles.length === 0) {
        setDropError('Solo se permiten archivos PDF.')
        return
      }

      setDropError(null)

      const newItems: PdfItem[] = pdfFiles.map((file) => ({
        id: generateId(),
        file,
        previewUrl: null,
        isPreviewLoading: true,
        previewError: null,
      }))

      setPdfItems((prev) => [...prev, ...newItems])
      newItems.forEach((item) => void requestPreview(item))
    },
    [generateId, requestPreview]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (event.dataTransfer.files?.length) handleFiles(event.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) handleFiles(event.target.files)
      event.target.value = ''
    },
    [handleFiles]
  )

  const handleOpenPicker = useCallback(() => inputRef.current?.click(), [])

  const handleRemove = useCallback((id: string) => {
    setPdfItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  // Keep ref in sync for cleanup
  useEffect(() => { itemsRef.current = pdfItems }, [pdfItems])

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const contextValue = useMemo<PdfOutletContext>(() => ({ pdfItems }), [pdfItems])

  /* ─── Preview Panel (shared between desktop col & mobile drawer) ─── */
  const previewPanel = (
    <div onDrop={handleDrop} onDragOver={handleDragOver} className="flex flex-col h-full retro-raised">
      {/* Drop zone */}
      <div
        className='retro-dropzone h-full flex flex-col items-center justify-center gap-2 p-4 cursor-pointer'
        tabIndex={0}
        onClick={handleOpenPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenPicker() }
        }}
        role='button'
      >
        <input ref={inputRef} type='file' accept='application/pdf' multiple onChange={handleInputChange} hidden />
        <PiUploadSimpleBold className="text-2xl text-accent" />
        <p className='text-xs text-text-muted font-ui text-center'>
          Arrastra y suelta tus PDFs aquí o haz clic para seleccionar.
        </p>
      </div>

      {dropError && <p className='text-xs text-error font-ui mt-2 text-center'>{dropError}</p>}

      {pdfItems.length > 0 && (
        <p className='text-xs text-text-muted font-ui text-center mt-2'>
          {pdfItems.length} archivo{pdfItems.length > 1 ? 's' : ''} cargado{pdfItems.length > 1 ? 's' : ''}
        </p>
      )}

      {/* 3D Carousel */}
      <PdfCarousel items={pdfItems} onRemove={handleRemove} />
    </div>
  )

  return (
    <>
      {/* ─── Desktop: 3-col grid ─── */}
      <div className='col-span-full w-full hidden lg:grid lg:grid-cols-3 gap-4'>
        <div className='col-span-2 flex items-center'>
          <Outlet context={contextValue} />
        </div>
        <div className='col-span-1 overflow-hidden'>
          {previewPanel}
        </div>
      </div>

      {/* ─── Mobile / Tablet ─── */}
      <div className='col-span-full w-full lg:hidden'>
        <button
          className='retro-btn flex items-center gap-2 mb-3'
          onClick={() => setPreviewDrawerOpen(true)}
          type='button'
        >
          <PiFilesBold className='text-base' />
          <span className='text-sm font-ui'>
            Archivos PDF {pdfItems.length > 0 && `(${pdfItems.length})`}
          </span>
        </button>

        <Outlet context={contextValue} />

        {/* Right-side drawer overlay */}
        {previewDrawerOpen && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setPreviewDrawerOpen(false)} />
        )}

        {/* Right-side drawer */}
        <div className={`
          fixed z-50 top-0 right-0 h-full w-[85vw] max-w-90
          bg-bg-window retro-raised flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${previewDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="retro-titlebar flex items-center justify-between px-3 py-2">
            <span className="font-retro text-base">Archivos PDF</span>
            <button
              className="retro-btn px-2 py-1 text-xs"
              onClick={() => setPreviewDrawerOpen(false)}
              aria-label="Cerrar panel"
              type='button'
            >
              <PiXBold />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {previewPanel}
          </div>
        </div>
      </div>
    </>
  )
}

export default PdfView