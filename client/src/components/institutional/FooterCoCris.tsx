import { Heart, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "wouter";

export default function FooterCoCris() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <div className="text-lg font-bold leading-tight">CoCris</div>
                <div className="text-xs text-gray-300">Coração de Cristo</div>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Associação Beneficente Coração de Cristo - Educação Infantil e Assistência Social 
              com afeto, excelência e cuidado desde 1995.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#sobre"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a
                  href="#unidades"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Nossas Unidades
                </a>
              </li>
              <li>
                <a
                  href="#transparencia"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Transparência
                </a>
              </li>
              <li>
                <a
                  href="#contato"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contato
                </a>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="text-blue-300 hover:text-blue-200 transition-colors duration-200 text-sm font-semibold">
                    Área do Colaborador
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">Institucional</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  História
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Estatuto
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Balanços
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Compliance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Trabalhe Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300 leading-relaxed">
                  Avenida Recanto das Emas, Quadra 301, Lote 26
                  <br />
                  Brasília-DF, Brasil
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a
                  href="tel:+556135754125"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  (61) 3575-4125 / 3575-4119
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a
                  href="mailto:contato@cocris.org"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  contato@cocris.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Associação Beneficente Coração de Cristo. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Ouvidoria
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
