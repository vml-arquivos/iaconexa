import { useState } from "react";
import { Link } from "wouter";
import { Heart, Menu, X, Users, Phone, Mail } from "lucide-react";

export default function NavbarCoCris() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-gray-900 leading-tight">
                  CoCris
                </div>
                <div className="text-xs text-gray-600">
                  Coração de Cristo
                </div>
              </div>
            </a>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#sobre"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Sobre Nós
            </a>
            <a
              href="#unidades"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Unidades
            </a>
            <a
              href="#transparencia"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Transparência
            </a>
            <a
              href="#contato"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Contato
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="mailto:contato@cocris.org">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                <Mail className="w-4 h-4" />
                <span>Contato</span>
              </button>
            </a>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Users className="w-5 h-5" />
                <span>Área do Colaborador</span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <a
              href="#sobre"
              onClick={toggleMenu}
              className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors duration-200"
            >
              Sobre Nós
            </a>
            <a
              href="#unidades"
              onClick={toggleMenu}
              className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors duration-200"
            >
              Unidades
            </a>
            <a
              href="#transparencia"
              onClick={toggleMenu}
              className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors duration-200"
            >
              Transparência
            </a>
            <a
              href="#contato"
              onClick={toggleMenu}
              className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors duration-200"
            >
              Contato
            </a>
            
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <a href="mailto:contato@cocris.org">
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200">
                  <Mail className="w-5 h-5" />
                  <span>contato@cocris.org</span>
                </button>
              </a>
              
              <a href="tel:+556135754125">
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200">
                  <Phone className="w-5 h-5" />
                  <span>(61) 3575-4125</span>
                </button>
              </a>
              
              <Link href="/dashboard">
                <button 
                  onClick={toggleMenu}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
                >
                  <Users className="w-5 h-5" />
                  <span>Área do Colaborador</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
