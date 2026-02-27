import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PiTrashBold, PiUploadSimpleBold, PiFilesBold, PiXBold } from "react-icons/pi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type PdfItem = {
  id: string
  file: File
  previewUrl: string | null
  isPreviewLoading: boolean
  previewError: string | null
}

export type PdfOutletContext = {
  pdfItems: PdfItem[]
}

function rotateYValue(i: number) {
  return Math.max(-80, -i * 20)
}

function xSpacing(i: number) {
  return i * 60 - (i * 30)
}

function zSpacing(i: number) {
  return -i * 400 - (i * i * 20)
}

const PdfView = () => {
  const [pdfItems, setPdfItems] = useState<PdfItem[]>([])
  const [order, setOrder] = useState<number[]>([]);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

  useEffect(() => {
    setOrder((prevOrder) => {
      if (prevOrder.length === pdfItems.length) return prevOrder;
      if (prevOrder.length < pdfItems.length) {
        const newIndices = Array.from({ length: pdfItems.length - prevOrder.length }, (_, i) => prevOrder.length + i);
        return [...prevOrder, ...newIndices];
      }
      return pdfItems.map((_, i) => i);
    });
  }, [pdfItems]);

  const [dropError, setDropError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef<PdfItem[]>([])

  const goToIndex = useCallback((targetIndex: number) => {
    setOrder((prevOrder) => {
      const currentPos = prevOrder.indexOf(targetIndex);
      if (currentPos <= 0) return prevOrder;

      const newOrder = [...prevOrder];
      newOrder.splice(currentPos, 1);
      newOrder.unshift(targetIndex);
      return newOrder;
    });
  }, []);

  const onChange = useCallback((dir: number) => {
    setOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      if (dir === 1) {
        newOrder.push(newOrder.shift()!);
      } else {
        newOrder.unshift(newOrder.pop()!);
      }
      return newOrder;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange(1);
      if (e.key === "ArrowLeft") onChange(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onChange]);

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
            ? {
              ...current,
              previewUrl: url,
              isPreviewLoading: false,
              previewError: null,
            }
            : current
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado.'
      setPdfItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? {
              ...current,
              previewUrl: null,
              isPreviewLoading: false,
              previewError: message,
            }
            : current
        )
      )
    }
  }, [])

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files)
      const pdfFiles = incoming.filter((file) =>
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
      newItems.forEach((item) => {
        void requestPreview(item)
      })
    },
    [generateId, requestPreview]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (event.dataTransfer.files?.length) {
        handleFiles(event.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        handleFiles(event.target.files)
      }
      event.target.value = ''
    },
    [handleFiles]
  )

  const handleOpenPicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleRemove = useCallback((id: string) => {
    setPdfItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  useEffect(() => {
    itemsRef.current = pdfItems
  }, [pdfItems])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
    }
  }, [])

  const contextValue = useMemo<PdfOutletContext>(
    () => ({ pdfItems }),
    [pdfItems]
  )

  /* ─── Preview Panel Content (shared between desktop col and mobile drawer) ─── */
  const previewPanel = (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex flex-col h-full retro-raised"
    >
      {/* Drop zone */}
      <div
        className='retro-dropzone h-full flex flex-col items-center justify-center gap-2 p-4 cursor-pointer'
        tabIndex={0}
        onClick={handleOpenPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleOpenPicker()
          }
        }}
        role='button'
      >
        <input
          ref={inputRef}
          type='file'
          accept='application/pdf'
          multiple
          onChange={handleInputChange}
          hidden
        />
        <PiUploadSimpleBold className="text-2xl text-accent" />
        <p className='text-xs text-text-muted font-ui text-center'>
          Arrastra y suelta tus PDFs aquí o haz clic para seleccionar.
        </p>
      </div>

      {dropError && (
        <p className='text-xs text-error font-ui mt-2 text-center'>{dropError}</p>
      )}

      {/* File count badge */}
      {pdfItems.length > 0 && (
        <p className='text-xs text-text-muted font-ui text-center mt-2'>
          {pdfItems.length} archivo{pdfItems.length > 1 ? 's' : ''} cargado{pdfItems.length > 1 ? 's' : ''}
        </p>
      )}

      {/* 3D Carousel */}
      <div className={`flex flex-1 min-h-80 lg:min-h-120 relative items-center justify-center mt-3 ${pdfItems.length === 0 ? 'hidden' : ''}`}
        style={{ perspective: "5000px" }}
      >
        {pdfItems.map((item, i) => {
          const pos = order.indexOf(i);
          if (pos === -1) return null;
          const x = xSpacing(pos);
          const z = zSpacing(pos);
          const rotateY = rotateYValue(pos);
          const zIndex = -pos;

          return (
            <div
              className='retro-window w-48 lg:w-56 absolute cursor-pointer flex flex-col justify-center items-center p-2 pt-0'
              key={item.id}
              onClick={() => goToIndex(i)}
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
                transformOrigin: "right center",
                transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg)`,
                zIndex: zIndex,
              }}
            >
              <div className='flex w-40 lg:w-48 min-h-52 lg:min-h-72 items-center justify-center'>
                {item.isPreviewLoading && (
                  <p className='text-xs text-text-muted font-ui'>Generando vista previa...</p>
                )}
                {!item.isPreviewLoading && item.previewUrl && (
                  <img src={item.previewUrl} alt={`Vista previa de ${item.file.name}`} className="max-w-full" />
                )}
                {!item.isPreviewLoading && item.previewError && (
                  <p className='text-xs text-error font-ui'>{item.previewError}</p>
                )}
              </div>

              <div className='w-full flex flex-col gap-1 mt-1'>
                <p className='truncate text-xs font-ui text-text' title={item.file.name}>
                  {item.file.name}
                </p>
                <div className='flex items-center w-full justify-center border-b border-border-dark pb-1'>
                  <p className='text-xs text-text-muted font-ui'>
                    {(item.file.size / 1000000).toFixed(2)} MB
                  </p>
                </div>
                <button
                  className='retro-btn-danger flex items-center justify-center gap-1 mx-auto mt-1 px-2 py-1 text-xs'
                  type='button'
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemove(item.id)
                  }}
                >
                  <PiTrashBold className='inline text-xs' />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* ─── Desktop layout: 3-col grid ─── */}
      <div className='col-span-full w-full hidden lg:grid lg:grid-cols-3 gap-4'>
        {/* Options area: col-span-2 */}
        <div className='col-span-2 flex items-center'>
          <Outlet context={contextValue} />
        </div>

        {/* Preview panel: col-span-1 */}
        <div className='col-span-1 overflow-hidden'>
          {previewPanel}
        </div>
      </div>

      {/* ─── Mobile / Tablet layout ─── */}
      <div className='col-span-full w-full lg:hidden'>
        {/* Mobile toggle button for preview drawer */}
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

        {/* Options area: full width */}
        <Outlet context={contextValue} />

        {/* ── Right-side Drawer Overlay ── */}
        {previewDrawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setPreviewDrawerOpen(false)}
          />
        )}

        {/* ── Right-side Drawer ── */}
        <div className={`
          fixed z-50 top-0 right-0 h-full w-[85vw] max-w-[360px]
          bg-bg-window retro-raised flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${previewDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Drawer header */}
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

          {/* Drawer content */}
          <div className="flex-1 overflow-auto p-3">
            {previewPanel}
          </div>
        </div>
      </div>
    </>
  )
}

export default PdfView