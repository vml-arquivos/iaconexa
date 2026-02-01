import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Search } from "lucide-react";
import { useState } from "react";

interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "reunion" | "event" | "holiday" | "meeting";
  description: string;
}

const agendaItems: AgendaItem[] = [
  {
    id: "1",
    title: "Reunião com Pais",
    date: "2025-12-20",
    time: "14:00",
    type: "meeting",
    description: "Reunião geral com responsáveis dos alunos",
  },
  {
    id: "2",
    title: "Festa de Encerramento",
    date: "2025-12-22",
    time: "10:00",
    type: "event",
    description: "Encerramento do ano letivo",
  },
  {
    id: "3",
    title: "Recesso Escolar",
    date: "2025-12-23",
    time: "00:00",
    type: "holiday",
    description: "Início do recesso de verão",
  },
];

export default function AgendaGeral() {
  const [searchTerm, setSearchTerm] = useState("");

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reunion":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-green-100 text-green-800";
      case "holiday":
        return "bg-red-100 text-red-800";
      case "meeting":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredItems = agendaItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agenda Geral</h1>
          <p className="text-slate-600 mt-1">Visualize e gerencie todos os eventos da escola</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>
      </Card>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini Calendar */}
        <Card className="p-6 h-fit">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600 mb-2">
              <div>Dom</div>
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sab</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className={`p-2 text-center text-sm rounded ${
                    i === 19 ? "bg-blue-500 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {i < 2 ? "" : i - 1}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type === "reunion"
                          ? "Reunião"
                          : item.type === "event"
                          ? "Evento"
                          : item.type === "holiday"
                          ? "Feriado"
                          : "Encontro"}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{item.description}</p>
                    <p className="text-xs text-slate-500">
                      📅 {new Date(item.date).toLocaleDateString("pt-BR")} às {item.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Deletar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600">Nenhum evento encontrado</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
