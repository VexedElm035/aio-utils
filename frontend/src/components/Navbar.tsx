import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
        <Link className='rounded-xl text-xl text-black hover:bg-gray-100 w-full px-5 py-1' to='/'>Home</Link>
        <Link className='rounded-xl text-xl text-black hover:bg-gray-100 w-full px-5 py-1' to='documents'>Documentos</Link>
        <Link className='rounded-xl text-xl text-black hover:bg-gray-100 w-full px-5 py-1' to='images'>Imágenes</Link>
        <Link className='rounded-xl text-xl text-black hover:bg-gray-100 w-full px-5 py-1' to='videos'>Videos</Link>
        <Link className='rounded-xl text-xl text-black hover:bg-gray-100 w-full px-5 py-1' to='audios'>Audios</Link>
    </>
  )
}

export default Navbar   