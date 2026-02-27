import { Link } from 'react-router-dom'

const pdfOptions = [
  { to: 'compress', label: 'Comprimir PDF' },
  { to: 'convert', label: 'Convertir PDF' },
  { to: 'merge', label: 'Unir PDF' },
  { to: 'split', label: 'Dividir PDF' },
  { to: 'ocr', label: 'OCR PDF' },
];

const PdfIndex = () => {
  return (
    <div className='col-span-full flex flex-row flex-wrap items-center justify-center gap-4'>
      {pdfOptions.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className='retro-raised flex items-center justify-center
            w-32 h-20 md:w-36 md:h-24 text-center text-sm font-ui
            no-underline text-text hover:bg-nav-hover transition-all cursor-pointer p-2'
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

export default PdfIndex