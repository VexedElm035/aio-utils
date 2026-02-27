import React from 'react'
import { Link } from 'react-router-dom'

const PdfIndex = () => {
  return (
    <div className='col-span-2 flex flex-row flex-wrap items-center justify-center gap-5'>
      <Link to="compress" 
            className='bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2'>
        Comprimir PDF
      </Link>
      <Link to="convert" className='bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2'>
        Convertir PDF
      </Link>
      <Link to="merge" className='bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2'>
        Unir PDF
      </Link>
      <Link to="split" className='bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2'>
        Dividir PDF
      </Link>
      <Link to="ocr" className='bg-white rounded-xl shadow-md w-35 h-24 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2'>
        OCR PDF
      </Link>
    </div>
  )
}

export default PdfIndex