import { Link, useLocation } from 'react-router-dom'
import { PiHouseBold, PiFilesBold, PiImageBold, PiVideoCameraBold, PiMusicNoteBold } from 'react-icons/pi'
import { IoSettingsOutline } from "react-icons/io5";

interface NavbarProps {
  onNavigate?: () => void;
}

const navItems = [
  { to: '/', label: 'Inicio', icon: PiHouseBold },
  { to: '/documents', label: 'Documentos', icon: PiFilesBold },
  { to: '/images', label: 'Imágenes', icon: PiImageBold },
  { to: '/videos', label: 'Videos', icon: PiVideoCameraBold },
  { to: '/audios', label: 'Audios', icon: PiMusicNoteBold },
  { to: '/settings', label: 'Ajustes', icon: IoSettingsOutline },
];

const Navbar = ({ onNavigate }: NavbarProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-1 w-full">
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to ||
          (to !== '/' && location.pathname.startsWith(to));

        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`
              flex items-center gap-2 px-3 py-2 text-sm font-ui no-underline transition-all
              ${isActive
                ? 'retro-inset bg-selection text-text font-semibold'
                : 'retro-btn hover:bg-nav-hover text-text'
              }
            `}
          >
            <Icon className="text-base flex-shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  )
}

export default Navbar