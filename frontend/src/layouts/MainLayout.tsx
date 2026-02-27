import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../contexts/ThemeProvider';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import { Routes } from '../routes/Routes';

const MainLayout = () => {
    const location = useLocation();
    const currentRoute = Routes.find(route => route.path === location.pathname)?.name || 'Home';

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <div className='w-screen h-screen grid grid-cols-[auto_1fr]'>
                <nav className='bg-white border-black border-r-2 flex flex-col py-5 px-2 items-start'>
                    <Navbar />
                </nav>
                <section className='bg-(--platinum-bg) pb-10 px-10 w-full'>
                    <Header headerText={currentRoute} />
                    <div className='bg-(--platinum-light) rounded-xl p-5 shadow-xl w-full col-span-full grid place-items-center grid-cols-3'>
                      <Outlet />
                    </div>
                </section>
            </div>
        </ThemeProvider>
    );
};

export default MainLayout