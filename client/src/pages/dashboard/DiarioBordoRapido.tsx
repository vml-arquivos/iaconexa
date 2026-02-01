import { useState } from "react";
import { BookOpen, Check, Utensils, Moon, Baby, Smile, Save } from "lucide-react";

interface Student {
  id: string;
  name: string;
  photo: string;
}

interface QuickAction {
  id: string;
  type: "alimentacao" | "sono" | "higiene" | "humor";
  label: string;
  icon: any;
  value: string;
  color: string;
}

const mockStudents: Student[] = [
  { id: "1", name: "Alice Siqueira", photo: "👧" },
  { id: "2", name: "Enzo Gabriel", photo: "👦" },
  { id: "3", name: "Sofia Martins", photo: "👧" },
  { id: "4", name: "Lucas Oliveira", photo: "👦" },
  { id: "5", name: "Maria Santos", photo: "👧" },
  { id: "6", name: "Pedro Costa", photo: "👦" },
];

const quickActions: QuickAction[] = [
  {
    id: "comeu_tudo",
    type: "alimentacao",
    label: "Almoçou Tudo",
    icon: Utensils,
    value: "COMEU_TUDO",
    color: "bg-green-500",
  },
  {
    id: "dormiu_bem",
    type: "sono",
    label: "Dormiu Bem",
    icon: Moon,
    value: "BOM",
    color: "bg-blue-500",
  },
  {
    id: "evacuacao_normal",
    type: "higiene",
    label: "Evacuação Normal",
    icon: Baby,
    value: "NORMAL",
    color: "bg-purple-500",
  },
  {
    id: "humor_feliz",
    type: "humor",
    label: "Humor Feliz",
    icon: Smile,
    value: "FELIZ",
    color: "bg-yellow-500",
  },
];

export default function DiarioBordoRapido() {
  const [selectedClass, setSelectedClass] = useState("Berçário 1");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [records, setRecords] = useState<{ [studentId: string]: { [actionId: string]: boolean } }>(
    {}
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedStudents.size === mockStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(mockStudents.map((s) => s.id)));
    }
  };

  const applyQuickAction = (actionId: string) => {
    if (selectedStudents.size === 0) {
      alert("Selecione pelo menos um aluno");
      return;
    }

    setRecords((prev) => {
      const newRecords = { ...prev };
      selectedStudents.forEach((studentId) => {
        if (!newRecords[studentId]) {
          newRecords[studentId] = {};
        }
        newRecords[studentId][actionId] = true;
      });
      return newRecords;
    });
  };

  const handleSave = () => {
    // Aqui seria a chamada à API
    console.log("Salvando registros:", records);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setRecords({});
      setSelectedStudents(new Set());
    }, 2000);
  };

  const getTotalRecords = () => {
    return Object.values(records).reduce(
      (sum, studentRecords) => sum + Object.keys(studentRecords).length,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Diário de Bordo Rápido
            </h1>
            <div className="text-xs text-gray-500 font-medium">
              Sistema <span className="font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">CONEXA</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Registre atividades em massa</p>
        </div>

        {/* Class Selector */}
        <div className="px-4 pb-4">
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
      </div>

      {/* Students Selection */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Selecionar Alunos</h2>
            <button
              onClick={toggleAll}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors text-sm"
            >
              {selectedStudents.size === mockStudents.length ? "Desmarcar Todos" : "Selecionar Todos"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mockStudents.map((student) => {
              const isSelected = selectedStudents.has(student.id);
              const studentRecords = records[student.id] || {};
              const recordCount = Object.keys(studentRecords).length;

              return (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="text-4xl mb-2">{student.photo}</div>
                  <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {student.name}
                  </div>
                  {recordCount > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {recordCount} registro{recordCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedStudents.size > 0
              ? `${selectedStudents.size} aluno(s) selecionado(s)`
              : "Selecione alunos acima para aplicar ações"}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => applyQuickAction(action.id)}
                  disabled={selectedStudents.size === 0}
                  className={`p-4 rounded-xl ${action.color} hover:opacity-90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Records Summary */}
        {getTotalRecords() > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo dos Registros</h2>
            <div className="space-y-3">
              {Object.entries(records).map(([studentId, studentRecords]) => {
                const student = mockStudents.find((s) => s.id === studentId);
                if (!student || Object.keys(studentRecords).length === 0) return null;

                return (
                  <div
                    key={studentId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{student.photo}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.keys(studentRecords).map((actionId) => {
                          const action = quickActions.find((a) => a.id === actionId);
                          if (!action) return null;
                          return (
                            <span
                              key={actionId}
                              className="text-xs px-2 py-1 bg-white rounded-full text-gray-700 border border-gray-200"
                            >
                              {action.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Button */}
      {getTotalRecords() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Salvar Registros ({getTotalRecords()})</span>
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registros Salvos!</h3>
            <p className="text-gray-600">
              Todos os registros foram salvos com sucesso no diário de bordo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
