import React from 'react'
import { PiArrowLeft } from "react-icons/pi";
import { Link } from 'react-router-dom'

const Header = ({ headerText }: { headerText: string }) => {

  const prevRoute = window.history.state?.idx > 0 ? -1 : '../';
  
  return (
    <div className='col-span-full relative flex w-full items-center justify-center py-3'>
      {window.location.pathname !== '/' ? (
        <div className='absolute left-0'>
          <Link className='flex flex-row items-center gap-1' to={prevRoute as string}>
            <PiArrowLeft className='text-sm' />
            <p className='text-xl' >Atrás</p>
          </Link>
        </div>
      ) : null}
      <div>
        <h2 className='text-2xl'>{headerText}</h2>
      </div>
    </div>
  )
}

export default Header