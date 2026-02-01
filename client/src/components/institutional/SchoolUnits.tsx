import { MapPin, Phone, Clock } from "lucide-react";

interface SchoolUnit {
  id: number;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  color: string;
  bgColor: string;
}

const units: SchoolUnit[] = [
  {
    id: 1,
    name: "CEPI Arara Canindé",
    address: "Endereço a ser definido",
    phone: "(61) 3575-4125",
    hours: "7h às 17h",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    name: "CEPI Beija Flor",
    address: "Endereço a ser definido",
    phone: "(61) 3575-4125",
    hours: "7h às 17h",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    id: 3,
    name: "Creche CoCris",
    address: "Avenida Recanto das Emas, Quadra 301, Lote 26",
    phone: "(61) 3575-4125 / 3575-4119",
    hours: "7h às 17h",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: 4,
    name: "CEPI Flamboyant",
    address: "Endereço a ser definido",
    phone: "(61) 3575-4125",
    hours: "7h às 17h",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: 5,
    name: "Creche Pelicano",
    address: "Endereço a ser definido",
    phone: "(61) 3575-4125",
    hours: "7h às 17h",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: 6,
    name: "Creche Rouxinol",
    address: "Endereço a ser definido",
    phone: "(61) 3575-4125",
    hours: "7h às 17h",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: 7,
    name: "CEPI Sabiá do Campo",
    address: "Endereço a ser definido",
    phone: "(61) 3575-4125",
    hours: "7h às 17h",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
];

export default function SchoolUnits() {
  return (
    <section id="unidades" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-600">7 Unidades</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Nossas Creches e CEPIs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Presente em diversas regiões de Brasília, levando educação de qualidade 
            e cuidado integral para mais de 1000 crianças
          </p>
        </div>

        {/* Units Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {units.map((unit) => (
            <div
              key={unit.id}
              className={`group relative ${unit.bgColor} p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100`}
            >
              {/* Unit Number Badge */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
                <span className={`text-sm font-bold ${unit.color}`}>
                  {unit.id}
                </span>
              </div>

              {/* Unit Name */}
              <h3 className={`text-xl font-bold ${unit.color} mb-4 pr-6`}>
                {unit.name}
              </h3>

              {/* Address */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 ${unit.color} flex-shrink-0 mt-0.5`} />
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {unit.address}
                  </p>
                </div>

                {unit.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className={`w-5 h-5 ${unit.color} flex-shrink-0`} />
                    <p className="text-sm text-gray-700">{unit.phone}</p>
                  </div>
                )}

                {unit.hours && (
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${unit.color} flex-shrink-0`} />
                    <p className="text-sm text-gray-700">{unit.hours}</p>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="mt-4 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className={`text-sm font-semibold ${unit.color} hover:underline`}>
                  Ver mais detalhes →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Quer conhecer uma de nossas unidades?
            </h3>
            <p className="text-gray-600 mb-6">
              Entre em contato conosco para agendar uma visita e conhecer nossa estrutura, 
              equipe e metodologia pedagógica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:contato@cocris.org">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Enviar E-mail
                </button>
              </a>
              <a href="tel:+556135754125">
                <button className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200">
                  Ligar Agora
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
