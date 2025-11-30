import { useState, useEffect } from 'react';
import { Button } from './button';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg py-4' : 'bg-white/95 backdrop-blur-sm py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">AcademiQa</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Features
            </button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Services
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Pricing
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Testimonials
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer whitespace-nowrap">
              Contact
            </button>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-green-600 font-medium transition-colors text-left cursor-pointer whitespace-nowrap">
                Features
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-green-600 font-medium transition-colors text-left cursor-pointer whitespace-nowrap">
                Services
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-green-600 font-medium transition-colors text-left cursor-pointer whitespace-nowrap">
                Pricing
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-green-600 font-medium transition-colors text-left cursor-pointer whitespace-nowrap">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-700 hover:text-green-600 font-medium transition-colors text-left cursor-pointer whitespace-nowrap">
                FAQ
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-green-600 font-medium transition-colors text-left cursor-pointer whitespace-nowrap">
                Contact
              </button>
              <div className="flex flex-col gap-3 pt-2">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                  Log In
                </Button>
                <Button size="sm" className="w-full" onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}