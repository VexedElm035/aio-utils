import React from 'react'
import { Link } from 'react-router-dom'
import { PiFilePdfLight, PiMicrosoftWordLogoLight } from "react-icons/pi";

const DocumentView = () => {
  return (
    <div className='flex col-span-full w-full items-center justify-center gap-10'>
      
      <Link className='flex flex-col justify-center items-center' to='pdf'>
        <PiFilePdfLight className='text-4xl' />
        <p className='text-xl'>PDF Tools</p>
      </Link>

      <Link className='flex flex-col justify-center items-center' to='word'>
        <PiMicrosoftWordLogoLight className='text-4xl' />
        <p className='text-xl'>Word Tools</p>
      </Link>

    </div>
  )
}

export default DocumentView