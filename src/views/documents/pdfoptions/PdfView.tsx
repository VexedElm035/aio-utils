import React from 'react'
import { Outlet } from 'react-router-dom'


const PdfView = () => {

  return (
    <>
      <Outlet />
      <div className='bg-red-300'>
        <input className='' type="file" />
      </div>
    </>
  )
}

export default PdfView