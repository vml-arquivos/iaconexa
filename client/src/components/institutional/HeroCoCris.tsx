import { Link } from "wouter";
import { Heart, Users, BookOpen } from "lucide-react";

export default function HeroCoCris() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-rose-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-6 animate-fade-in">
            {/* Logo/Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="text-sm font-medium text-gray-700">
                Desde 1995 transformando vidas
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gray-900">Associação</span>
              <br />
              <span className="text-blue-600">Coração de Cristo</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
              Educação Infantil e Assistência Social com{" "}
              <span className="font-semibold text-rose-500">afeto</span>,{" "}
              <span className="font-semibold text-blue-600">excelência</span> e{" "}
              <span className="font-semibold text-amber-500">cuidado</span>
            </p>

            {/* Mission Statement */}
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-700 bg-white/50 rounded-r-lg">
              "Contribuir para o desenvolvimento das potencialidades físicas e psíquicas das crianças, 
              tornando-as cidadãs criativas e conscientes."
            </blockquote>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/dashboard">
                <button className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Área do Colaborador
                  </span>
                </button>
              </Link>
              
              <a href="#unidades">
                <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Nossas Unidades
                  </span>
                </button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600">7</div>
                <div className="text-sm text-gray-600 mt-1">Unidades</div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-rose-500">1000+</div>
                <div className="text-sm text-gray-600 mt-1">Crianças</div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-amber-500">29</div>
                <div className="text-sm text-gray-600 mt-1">Anos</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-300 to-rose-300 flex items-center justify-center">
                <div className="text-center text-white space-y-4 p-8">
                  <Heart className="w-24 h-24 mx-auto animate-pulse" />
                  <p className="text-2xl font-semibold">
                    Espaço para foto das crianças
                  </p>
                  <p className="text-sm opacity-90">
                    Recomendado: 800x600px
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">BNCC</div>
                  <div className="text-xs text-gray-600">Alinhado</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl animate-float delay-500">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Cuidado</div>
                  <div className="text-xs text-gray-600">Integral</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
