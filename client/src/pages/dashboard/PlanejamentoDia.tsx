import { useState } from "react";
import { Calendar, Clock, CheckCircle2, Circle, Save, BookOpen } from "lucide-react";

interface Atividade {
  id: string;
  horario: string;
  titulo: string;
  campoExperiencia: string;
  descricao: string;
  materiais?: string[];
  realizada: boolean;
}

const mockAtividades: Atividade[] = [
  {
    id: "1",
    horario: "08:00",
    titulo: "Acolhida e Roda de Conversa",
    campoExperiencia: "O eu, o outro e o nós",
    descricao: "Momento de boas-vindas, músicas de chegada e conversa sobre o dia.",
    materiais: ["Violão", "Cartazes"],
    realizada: false,
  },
  {
    id: "2",
    horario: "09:00",
    titulo: "Exploração Sensorial",
    campoExperiencia: "Corpo, gestos e movimentos",
    descricao: "Atividades com texturas diferentes: areia, água, massinha.",
    materiais: ["Areia", "Água", "Massinha", "Recipientes"],
    realizada: false,
  },
  {
    id: "3",
    horario: "10:00",
    titulo: "Lanche da Manhã",
    campoExperiencia: "Corpo, gestos e movimentos",
    descricao: "Momento de alimentação e higiene.",
    realizada: false,
  },
  {
    id: "4",
    horario: "10:30",
    titulo: "Pintura com Tintas",
    campoExperiencia: "Traços, sons, cores e formas",
    descricao: "Exploração livre de cores e formas com tintas guache.",
    materiais: ["Tintas guache", "Papel A3", "Pincéis", "Aventais"],
    realizada: false,
  },
  {
    id: "5",
    horario: "11:30",
    titulo: "Almoço",
    campoExperiencia: "Corpo, gestos e movimentos",
    descricao: "Refeição principal e higiene.",
    realizada: false,
  },
  {
    id: "6",
    horario: "12:30",
    titulo: "Hora do Sono",
    campoExperiencia: "Corpo, gestos e movimentos",
    descricao: "Momento de descanso com música suave.",
    materiais: ["Colchonetes", "Lençóis", "Música ambiente"],
    realizada: false,
  },
  {
    id: "7",
    horario: "14:30",
    titulo: "Contação de História",
    campoExperiencia: "Escuta, fala, pensamento e imaginação",
    descricao: "História ilustrada com fantoches sobre animais.",
    materiais: ["Livro", "Fantoches", "Tapete"],
    realizada: false,
  },
  {
    id: "8",
    horario: "15:30",
    titulo: "Lanche da Tarde",
    campoExperiencia: "Corpo, gestos e movimentos",
    descricao: "Lanche e higiene.",
    realizada: false,
  },
  {
    id: "9",
    horario: "16:00",
    titulo: "Brincadeiras Livres",
    campoExperiencia: "O eu, o outro e o nós",
    descricao: "Momento de interação livre com brinquedos e colegas.",
    materiais: ["Brinquedos diversos", "Blocos de montar"],
    realizada: false,
  },
];

export default function PlanejamentoDia() {
  const [selectedClass, setSelectedClass] = useState("Berçário 1");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [atividades, setAtividades] = useState<Atividade[]>(mockAtividades);
  const [observacoes, setObservacoes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleAtividade = (id: string) => {
    setAtividades((prev) =>
      prev.map((ativ) => (ativ.id === id ? { ...ativ, realizada: !ativ.realizada } : ativ))
    );
  };

  const getProgress = () => {
    const realizadas = atividades.filter((a) => a.realizada).length;
    const total = atividades.length;
    return { realizadas, total, percentage: (realizadas / total) * 100 };
  };

  const handleSave = () => {
    // Aqui seria a chamada à API
    console.log("Salvando planejamento:", {
      class: selectedClass,
      date: selectedDate,
      atividades,
      observacoes,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Planejamento do Dia
            </h1>
            <div className="text-xs text-gray-500 font-medium">
              Sistema <span className="font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">CONEXA</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Acompanhe e registre as atividades</p>
        </div>

        {/* Class and Date Selector */}
        <div className="px-4 pb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Berçário 1</option>
              <option>Berçário 2</option>
              <option>Maternal 1</option>
              <option>Maternal 2</option>
              <option>Pré 1</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso do Dia</span>
              <span className="text-sm font-bold text-blue-600">
                {progress.realizadas}/{progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="p-4 space-y-3">
        {atividades.map((atividade) => (
          <div
            key={atividade.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
              atividade.realizada
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => toggleAtividade(atividade.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {atividade.realizada ? (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-400 hover:text-blue-600" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      {atividade.horario}
                    </span>
                  </div>
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      atividade.realizada ? "text-green-900" : "text-gray-900"
                    }`}
                  >
                    {atividade.titulo}
                  </h3>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {atividade.campoExperiencia}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-3 ml-10">{atividade.descricao}</p>

              {/* Materials */}
              {atividade.materiais && atividade.materiais.length > 0 && (
                <div className="ml-10">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Materiais:</div>
                  <div className="flex flex-wrap gap-2">
                    {atividade.materiais.map((material, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Observações */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações do Dia
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione observações sobre o dia, comportamento da turma, ajustes necessários..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Salvar Planejamento</span>
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Planejamento Salvo!</h3>
            <p className="text-gray-600">
              O planejamento do dia foi registrado com sucesso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
