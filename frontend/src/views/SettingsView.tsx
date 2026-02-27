import ThemeToggle from '../components/ThemeToggle'
import { useStyleTheme } from '../contexts/StyleThemeProvider'
import type { StyleTheme } from '../contexts/StyleThemeProvider'
import { PiMonitorBold, PiFloppyDiskBold } from 'react-icons/pi'

const styleThemeOptions: { value: StyleTheme; label: string; desc: string; icon: typeof PiMonitorBold }[] = [
  {
    value: 'retro',
    label: 'Retro Digital',
    desc: 'Skeuomórfico, bordes 3D, tipografía monoespaciada',
    icon: PiFloppyDiskBold,
  },
  {
    value: 'modern',
    label: 'Moderno',
    desc: 'Limpio, redondeado, sombras suaves, tipografía sans-serif',
    icon: PiMonitorBold,
  },
];

const SettingsView = () => {
  const { styleTheme, setStyleTheme } = useStyleTheme();

  return (
    <div className="col-span-full w-full flex flex-col gap-6">

      {/* ── Apariencia (Modo Oscuro / Claro) ── */}
      <div className="retro-window p-4 flex flex-col gap-3">
        <h3 className="font-retro text-lg text-text m-0">Modo de Color</h3>
        <p className="text-xs text-text-muted font-ui m-0">
          Cambia entre modo claro, oscuro o sigue la configuración del sistema.
        </p>
        <ThemeToggle />
      </div>

      {/* ── Tema Visual ── */}
      <div className="retro-window p-4 flex flex-col gap-3">
        <h3 className="font-retro text-lg text-text m-0">Tema Visual</h3>
        <p className="text-xs text-text-muted font-ui m-0">
          Elige la apariencia general de la interfaz.
        </p>

        <div className="flex flex-wrap gap-4">
          {styleThemeOptions.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setStyleTheme(value)}
              className={`retro-radio-card flex flex-col items-center gap-2
                w-full sm:w-52 p-4 text-left cursor-pointer
                ${styleTheme === value ? 'selected' : ''}`}
            >
              <Icon className="text-2xl text-accent" />
              <span className="font-ui font-semibold text-sm text-text">{label}</span>
              <span className="text-xs text-text-muted text-center">{desc}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default SettingsView