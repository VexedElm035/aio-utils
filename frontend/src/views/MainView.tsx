import { Link } from 'react-router-dom'
import { PiFilesBold, PiImageBold, PiVideoCameraBold, PiMusicNoteBold } from 'react-icons/pi'

const categories = [
  { to: 'documents', label: 'Documentos', icon: PiFilesBold, desc: 'PDF, Word y más' },
  { to: 'images', label: 'Imágenes', icon: PiImageBold, desc: 'Editar y convertir' },
  { to: 'videos', label: 'Videos', icon: PiVideoCameraBold, desc: 'Procesar video' },
  { to: 'audios', label: 'Audios', icon: PiMusicNoteBold, desc: 'Audio tools' },
];

const MainView = () => {
  return (
    <>
      {categories.map(({ to, label, icon: Icon, desc }) => (
        <Link
          key={to}
          to={to}
          className="retro-raised flex flex-col items-center justify-center gap-2
            p-5 w-full h-32 no-underline text-text
            hover:bg-nav-hover active:retro-inset transition-all cursor-pointer"
        >
          <Icon className="text-3xl text-accent" />
          <span className="font-retro text-lg">{label}</span>
          <span className="text-xs text-text-muted">{desc}</span>
        </Link>
      ))}
    </>
  )
}

export default MainView