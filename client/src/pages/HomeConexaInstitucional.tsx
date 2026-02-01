// ========================================
// SISTEMA CONEXA v1.0
// Landing Page Institucional
// "Conectando Vidas"
// ========================================

import { Link } from 'wouter';
import { 
  Heart, 
  Shield, 
  Users, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Building2,
  GraduationCap,
  Baby,
  Utensils,
  FileText,
} from 'lucide-react';

export default function HomeConexaInstitucional() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CONEXA
              </h1>
              <p className="text-xs text-gray-600">Conectando Vidas</p>
            </div>
          </div>
          
          <Link href="/login">
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2">
              Área do Colaborador
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              ERP Educacional para Creches
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Conectando
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Vidas
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              O <strong>CONEXA</strong> é o sistema que cuida de quem cuida. 
              Gestão inteligente para a rede CoCris, com foco em <strong>dignidade</strong>, 
              <strong> qualidade pedagógica</strong> e <strong>simplicidade operacional</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/login">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Acessar Sistema
                </button>
              </Link>
              
              <a href="#sobre">
                <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                  Saiba Mais
                </button>
              </a>
            </div>
            
            {/* STATS */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">7</div>
                <div className="text-sm text-gray-600 mt-1">Unidades</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">1000+</div>
                <div className="text-sm text-gray-600 mt-1">Crianças</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600">29</div>
                <div className="text-sm text-gray-600 mt-1">Anos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALORES SECTION */}
      <section id="sobre" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nossos Pilares
            </h2>
            <p className="text-xl text-gray-600">
              O que nos move e nos torna únicos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Dignidade */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Baby className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Dignidade
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Garantir que nenhuma criança fique sem os insumos essenciais. 
                Fraldas, leite e higiene são direitos, não privilégios.
              </p>
            </div>
            
            {/* Qualidade Pedagógica */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Qualidade Pedagógica
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Planejamentos alinhados à BNCC, atividades personalizadas 
                e suporte de IA para educadores.
              </p>
            </div>
            
            {/* Simplicidade */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Simplicidade Operacional
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Interfaces intuitivas, processos automatizados e menos burocracia. 
                Mais tempo para o que importa: as crianças.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS SECTION */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Módulos Inteligentes
            </h2>
            <p className="text-xl text-gray-600">
              Tecnologia a serviço da educação infantil
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Módulo ZELO */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Módulo ZELO
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Gestão inteligente de insumos que <strong>nunca deixa faltar o essencial</strong>. 
                    Previsão de consumo, alertas automáticos e recomendações de compra.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Zero faltas
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Alertas críticos
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Economia de 30%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Módulo IA MENTORA */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Módulo IA MENTORA
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    IA que sugere atividades BNCC personalizadas e <strong>detecta precocemente</strong> 
                    problemas de desenvolvimento.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      IA + BNCC
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Alertas de desenvolvimento
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      5h/semana economizadas
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Módulo DOCUMENTOS */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Módulo DOCUMENTOS
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Gera automaticamente documentos oficiais (Diário de Classe, RIA). 
                    <strong>Menos papel, mais tempo com as crianças</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                      PDFs automáticos
                    </span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                      95% menos burocracia
                    </span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                      10h/mês economizadas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIDADES SECTION */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nossas 7 Unidades
            </h2>
            <p className="text-xl text-gray-600">
              Rede CoCris de Educação Infantil
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'CEPI Arara Canindé',
              'CEPI Beija-Flor',
              'CEPI Sabiá',
              'CEPI Tucano',
              'Creche CoCris Sede',
              'Creche Comunitária Norte',
              'Creche Comunitária Sul',
            ].map((unidade, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all duration-300"
              >
                <Building2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  {unidade}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar a gestão escolar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se à revolução da educação infantil com dignidade e tecnologia.
          </p>
          <Link href="/login">
            <button className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Acessar Área do Colaborador
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl font-bold">CONEXA</h3>
                <p className="text-sm text-gray-400">Conectando Vidas v1.0</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2026 Associação Beneficente Coração de Cristo
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Tecnologia que conecta, educação que transforma
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
