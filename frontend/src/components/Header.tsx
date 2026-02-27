import { PiArrowLeftBold } from "react-icons/pi";
import { Link } from 'react-router-dom'

const Header = ({ headerText }: { headerText: string }) => {

  const prevRoute = window.history.state?.idx > 0 ? -1 : '../';
  const isHome = window.location.pathname === '/';

  return (
    <div className='retro-titlebar flex items-center justify-between mx-2 mt-2 md:mx-4 md:mt-4'>
      <div className="w-20">
        {!isHome && (
          <Link
            className='retro-btn text-xs flex items-center gap-1 no-underline px-2 py-1 text-text'
            to={prevRoute as string}
          >
            <PiArrowLeftBold className='text-xs' />
            <span>Atrás</span>
          </Link>
        )}
      </div>
      <h2 className='font-retro text-lg md:text-xl text-white m-0 text-center'>
        {headerText}
      </h2>
      <div className="w-20" />
    </div>
  )
}

export default Header