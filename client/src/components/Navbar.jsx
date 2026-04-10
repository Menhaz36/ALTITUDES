import React from 'react';
import { Link } from 'react-router-dom';
import assets from '../assets/assets.js';
import { HashLink } from 'react-router-hash-link';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = React.useContext(AuthContext);
    const [Loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Home', path: '/#home' },
        { name: 'About', path: '/#about' },
    ];

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
        alert("Logged out successfully");
        navigate('/Login');
    }

    {/* Logout Button
                {user && (
                    <div
                        onClick={handleLogout}
                        className={` text-white rounded-full py-0 transition-all duration-300`}
                    >
                        Logout
                    </div>
                )} */}


    let username = 'Guest';
    if (user) {
        username = user.name;
    }

    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    return (
        <nav className={`fixed top-0 left-0 bg-black w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4" : "py-4 md:py-6"}`}>

            {/* Logo */}
            <HashLink smooth to='/#home' className="flex items-center gap-2">
                <img
                    src={assets.logo}
                    alt="Logo"
                    className={`h-10 w-auto transition-all duration-300 ${isScrolled && "opacity-80"}`}
                />
                <span className={`font-bold text-xl ${isScrolled ? "text-gray-700" : "text-white"}`}>Altitudes</span>
            </HashLink>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {navLinks.map((link, i) => (
                    <HashLink
                        smooth
                        key={i} to={link.path} className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                        {link.name}
                        <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                    </HashLink>
                ))}


            </div>

            {/* Desktop Right */}
            <style>{`
                .button-wrapper::before {
                    animation: spin-gradient 4s linear infinite;
                }
            
                @keyframes spin-gradient {
                    from {
                        transform: rotate(0deg);
                    }
            
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
            <div className="relative inline-block p-0.5 rounded-full overflow-hidden hover:scale-105 transition duration-300 active:scale-100 before:content-[''] before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,_#FFFFFF,_#FFFFFF30,_#FFFFFF)] button-wrapper group">
                <button
                    onClick={handleLogout}
                    className="relative z-10 bg-black text-white rounded-full px-8 py-3 font-medium text-sm cursor-pointer"
                >
                    <span className="block transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                        {username}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        Logout
                    </span>
                </button>
            </div>


            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
                <img src={assets.menuIcon} alt="Menu" onClick={() => setIsMenuOpen(true)} className={`h-4 w-6 cursor-pointer ${isScrolled && "invert"}`} />
            </div>

            {/* Mobile Menu */}
            <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                    <img onClick={() => setIsMenuOpen(!isMenuOpen)} src={assets.closeIcon} alt="Close" className="h-6 w-6 cursor-pointer" />
                </button>

                {navLinks.map((link, i) => (
                    <HashLink smooth key={i} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-gray-700">
                        {link.name}
                    </HashLink>
                ))}



                <Link to="/login" className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
                    Login
                </Link>
            </div>
        </nav>

    );
}

export default Navbar;