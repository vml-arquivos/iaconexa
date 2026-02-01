import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckSquare, 
  Calendar,
  Users,
  FileText
} from "lucide-react";

const mockTarefas = [
  { id: 1, title: "Redação: Minhas Férias", turma: "5º Ano A", status: "active", dueDate: "15/12/2025", submitted: 18, total: 25 },
  { id: 2, title: "Exercícios de Frações", turma: "5º Ano B", status: "active", dueDate: "16/12/2025", submitted: 12, total: 24 },
  { id: 3, title: "Projeto Sistema Solar", turma: "4º Ano A", status: "draft", dueDate: "20/12/2025", submitted: 0, total: 22 },
  { id: 4, title: "Leitura: O Pequeno Príncipe", turma: "5º Ano A", status: "completed", dueDate: "10/12/2025", submitted: 24, total: 25 },
];

export default function TarefasList() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>;
      case "draft": return <Badge variant="outline">Rascunho</Badge>;
      case "completed": return <Badge className="bg-blue-500 hover:bg-blue-600">Concluída</Badge>;
      default: return <Badge variant="secondary">Arquivada</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie atividades, trabalhos e avaliações das suas turmas.</p>
        </div>
        <Link href="/dashboard/tarefas/nova">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-4 border-b border-border/40">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar tarefas..." 
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {mockTarefas.map((task) => (
              <div key={task.id} className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <Link href={`/dashboard/tarefas/${task.id}/correcao`}>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer hover:underline">
                        {task.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {task.turma}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Entrega: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Entregas</p>
                    <p className="font-medium text-foreground">
                      <span className="text-primary font-bold">{task.submitted}</span> / {task.total}
                    </p>
                  </div>
                  <div className="w-24 text-center">
                    {getStatusBadge(task.status)}
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
