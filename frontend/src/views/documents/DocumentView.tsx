import { Link } from 'react-router-dom'
import { PiFilePdfBold, PiMicrosoftWordLogoBold } from "react-icons/pi";

const DocumentView = () => {
  return (
    <div className='flex flex-wrap col-span-full w-full items-center justify-center gap-6'>

      <Link className='retro-raised flex flex-col justify-center items-center gap-2
        w-36 h-28 no-underline text-text hover:bg-nav-hover transition-all' to='pdf'>
        <PiFilePdfBold className='text-3xl text-accent' />
        <span className='font-retro text-lg'>PDF Tools</span>
      </Link>

      <Link className='retro-raised flex flex-col justify-center items-center gap-2
        w-36 h-28 no-underline text-text hover:bg-nav-hover transition-all' to='word'>
        <PiMicrosoftWordLogoBold className='text-3xl text-accent' />
        <span className='font-retro text-lg'>Word Tools</span>
      </Link>

    </div>
  )
}

export default DocumentView