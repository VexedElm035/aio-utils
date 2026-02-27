import { useTheme } from '../contexts/ThemeProvider';
import { PiSunBold, PiMoonBold, PiDesktopBold } from 'react-icons/pi';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: 'light' as const, icon: PiSunBold, label: 'Light' },
        { value: 'system' as const, icon: PiDesktopBold, label: 'System' },
        { value: 'dark' as const, icon: PiMoonBold, label: 'Dark' },
    ];

    return (
        <div className="retro-inset p-1 flex gap-0.5">
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-ui transition-all cursor-pointer
                        ${theme === value
                            ? 'retro-btn active bg-selection text-text'
                            : 'bg-transparent text-text-muted hover:bg-nav-hover hover:text-text'
                        }`}
                    title={label}
                    aria-label={`${label} theme`}
                >
                    <Icon className="text-sm" />
                    <span className="hidden md:inline">{label}</span>
                </button>
            ))}
        </div>
    );
};

export default ThemeToggle;
