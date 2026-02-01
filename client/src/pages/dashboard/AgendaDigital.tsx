import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Bell } from "lucide-react";

export default function AgendaDigital() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agenda Digital</h1>
          <p className="text-slate-600 mt-1">Notificações e lembretes digitais</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nova Notificação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Notificações Ativas</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-slate-600 text-sm mt-2">Lembretes programados</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-slate-900">Emails Enviados</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">45</p>
          <p className="text-slate-600 text-sm mt-2">Este mês</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Notificações Recentes</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Notificação #{i}</p>
              <p className="text-sm text-slate-600">Descrição da notificação</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
