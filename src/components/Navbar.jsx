import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: 'MENU', path: '/' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'GALLERY', path: '/gallery' },
    { label: 'SERVICES', path: '/services' },
    { label: 'PROJECTS', path: '/projects' },
    { label: 'CONTACTS', path: '/contact' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'premium-navbar premium-navbar-scrolled py-3' : 'premium-navbar py-4 sm:py-5'
    }`}>
      <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" aria-label="Arcforma Studio Home">
          <img
            src="/img/logo.png"
            alt="Arcforma Studio Logo"
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border border-[#efe0bd]/70 shadow-[0_12px_35px_rgba(0,0,0,0.35),0_0_22px_rgba(239,224,189,0.18)] transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`relative font-heading text-xs tracking-widest font-semibold transition-all duration-300 after:absolute after:left-0 after:-bottom-2 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:text-primary hover:after:scale-x-100 ${
                  isActive(item.path)
                    ? 'text-primary after:scale-x-100'
                    : 'text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none hover:text-primary transition-colors duration-300"
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed top-[82px] left-0 w-full bg-[#090909]/90 border-b border-[#efe0bd]/15 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out z-40">
          <ul className="flex flex-col py-6 px-6 gap-4">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`block py-2 font-heading text-sm tracking-widest font-semibold ${
                    isActive(item.path) ? 'text-primary' : 'text-white'
                  } hover:translate-x-1 hover:text-primary transition-all duration-300`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
