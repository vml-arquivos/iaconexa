import { Target, Eye, Heart } from "lucide-react";

export default function MissionVision() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Nossos Princípios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Os valores que guiam nosso trabalho e transformam a educação infantil
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Missão */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Missão
              </h3>
              
              <p className="text-gray-700 leading-relaxed">
                Contribuir para o desenvolvimento das potencialidades físicas e psíquicas das crianças, 
                direcionando-as para a conquista de Valor Humano Universal, tornando-as cidadãs criativas, 
                conscientes de seu papel e responsabilidades, capazes de lidar com uma sociedade em constante mutação.
              </p>
            </div>
          </div>

          {/* Visão */}
          <div className="group relative bg-gradient-to-br from-rose-50 to-rose-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Visão
              </h3>
              
              <p className="text-gray-700 leading-relaxed">
                Ser reconhecida como uma OSC de Excelência em Educação Infantil, transmitindo valores 
                baseados na moral e na ética e promovendo o conhecimento com afeto e respeito, de forma 
                lúdica e criativa num ambiente de cuidados, afeto e aprendizagem responsável, saudável e feliz.
              </p>
            </div>
          </div>

          {/* Valores */}
          <div className="group relative bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Valores
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                A ABCC tem Valores que norteiam o trabalho na instituição e visa a "Qualidade" 
                nas relações humanas, baseadas em:
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="font-semibold">Afeto</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="font-semibold">Respeito</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="font-semibold">Solidariedade</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="font-semibold">Alegria</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Biblical Quote */}
        <div className="mt-16 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 via-white to-rose-50 p-8 rounded-2xl shadow-lg border border-gray-100">
            <blockquote className="text-lg sm:text-xl text-gray-700 italic mb-3">
              "E tudo quanto fizerdes, fazei-o de coração, como ao Senhor, e não aos homens."
            </blockquote>
            <cite className="text-sm font-semibold text-blue-600">
              Colossenses 3:23
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}
