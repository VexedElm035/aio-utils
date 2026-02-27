import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PiTrash } from "react-icons/pi";

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

function rotateYValue(i: number){
  return Math.max(-80, -i * 20)
}

function xSpacing(i: number){
  return i * 60 - (i * 30)
}

function zSpacing(i: number){
  return -i * 400 - (i * i * 20)
}

const PdfView = () => {
  const [pdfItems, setPdfItems] = useState<PdfItem[]>([])
  const [order, setOrder] = useState<number[]>([]);

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

  return (
    <>
      <Outlet context={contextValue} />

      <div className='bg-gray-300'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className='bg-blue-200'
          tabIndex={0}
          onClick={handleOpenPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleOpenPicker()
            }
          }}
          role='button'>
          <input
            ref={inputRef}
            type='file'
            accept='application/pdf'
            multiple
            onChange={handleInputChange}
            hidden
            />
          <div>
            <p>Arrastra y suelta tus PDFs aqui o haz clic para seleccionar.</p>
          </div>
        </div>

        {dropError && <p>{dropError}</p>}

        <div className='flex h-120 relative items-center justify-center' style={{ perspective: "5000px" }}>

          {pdfItems.map((item, i) => {
            const pos = order.indexOf(i);
            if (pos === -1) return null;
            const x = xSpacing(pos);
            const z = zSpacing(pos);
            const rotateY = rotateYValue(pos);
            const zIndex = -pos;

            return (
            <div 
              className='bg-white border border-gray-400 rounded-xl shadow-md w-65 absolute cursor-pointer flex flex-col justify-center items-center p-3 pt-0' 
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
              <div className='flex w-55 min-h-80 items-center justify-center'>
                {item.isPreviewLoading && <p>Generando vista previa...</p>}
                {!item.isPreviewLoading && item.previewUrl && (
                  <img src={item.previewUrl} alt={`Vista previa de ${item.file.name}`} />
                )}
                {!item.isPreviewLoading && item.previewError && (
                  <p>{item.previewError}</p>
                )}
              </div>

              <div className='w-full flex flex-col gap-1'>
                <p className='truncate' title={item.file.name}>{item.file.name}</p>
                <div className='flex items-center w-full justify-center border-b pb-2'>
                  <p className='text-sm text-gray-600'>{(item.file.size / 1000000).toFixed(2)} MB</p>
                </div>
                <button className='bg-red-600 rounded-xl w-25 h-10 flex items-center justify-center mx-auto mt-2'
                  type='button'
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemove(item.id)
                  }}
                  >
                    <p className='text-sm text-white flex flex-row items-center gap-1'>
                      <PiTrash className='inline' />
                    Eliminar
                    </p>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </>
  )
}

export default PdfView