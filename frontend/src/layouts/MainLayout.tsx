import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../contexts/ThemeProvider';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import { Routes } from '../routes/Routes';
import { PiListBold, PiXBold } from 'react-icons/pi';

const MainLayout = () => {
    const location = useLocation();
    const currentRoute = Routes.find(route => route.path === location.pathname)?.name || 'Inicio';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <div className='w-screen h-screen flex flex-col md:grid md:grid-cols-[220px_1fr] bg-bg overflow-hidden'>

                {/* ── Mobile Top Bar ── */}
                <div className="md:hidden retro-titlebar flex items-center justify-between px-3 py-2">
                    <button
                        className="retro-btn px-2 py-1 text-sm"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <PiXBold /> : <PiListBold />}
                    </button>
                
                </div>

                {/* ── Mobile Drawer Overlay ── */}
                {mobileMenuOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-40 bg-black/30"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* ── Sidebar / Mobile Drawer ── */}
                <nav className={`
                    fixed md:static z-50 top-0 left-0 h-full w-55
                    bg-nav-bg retro-raised flex flex-col py-4 px-2 gap-2
                    transform transition-transform duration-200 ease-in-out
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}>
                    {/* Logo / Brand */}
                    <div className="retro-titlebar text-center mb-2">
                        <span className="font-retro text-lg tracking-wider">AIO Utils</span>
                    </div>

                    <Navbar onNavigate={() => setMobileMenuOpen(false)} />

                </nav>

                {/* ── Main Content ── */}
                <section className='bg-bg flex flex-col overflow-auto flex-1'>
                    <Header headerText={currentRoute} />
                    <div className='retro-window mx-2 mb-2 md:mx-4 md:mb-4 p-3 md:p-5 flex-1
                        flex flex-col items-center'>
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
                            <Outlet />
                        </div>
                    </div>
                </section>
            </div>
        </ThemeProvider>
    );
};

export default MainLayout