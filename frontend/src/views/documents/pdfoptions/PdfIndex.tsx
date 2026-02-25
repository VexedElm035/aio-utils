import React from 'react'
import { Link } from 'react-router-dom'

const PdfIndex = () => {
  return (
    <div className='col-span-2 flex flex-col'>
      <Link to="compress">Compress PDF</Link>
      <Link to="convert">Convert PDF</Link>
      <Link to="ocr">OCR PDF</Link>
      <Link to="split">Split PDF</Link>
    </div>
  )
}

export default PdfIndex