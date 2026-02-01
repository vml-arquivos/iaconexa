import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const mockPlanejamentos = [
  { id: 1, title: "História do Brasil - Período Colonial", turma: "5º Ano A", status: "approved", date: "14/12/2025", score: 98 },
  { id: 2, title: "Frações e Números Decimais", turma: "4º Ano B", status: "pending", date: "13/12/2025", score: 85 },
  { id: 3, title: "Ecossistemas Brasileiros", turma: "5º Ano A", status: "draft", date: "12/12/2025", score: null },
  { id: 4, title: "Gêneros Textuais: Crônica", turma: "4º Ano C", status: "revision", date: "10/12/2025", score: 72 },
];

export default function PlanejamentosList() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>;
      case "pending": return <Badge className="bg-orange-500 hover:bg-orange-600">Em Análise</Badge>;
      case "revision": return <Badge className="bg-red-500 hover:bg-red-600">Revisão</Badge>;
      default: return <Badge variant="outline">Rascunho</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Planejamentos</h1>
          <p className="text-muted-foreground">Gerencie seus planos de aula e acompanhe as aprovações.</p>
        </div>
        <Link href="/dashboard/planejamentos/novo">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Novo Planejamento
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-4 border-b border-border/40">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar planejamentos..." 
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
            {mockPlanejamentos.map((plan) => (
              <div key={plan.id} className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {plan.turma}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {plan.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {plan.score && (
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Score BNCC</p>
                      <p className={`font-bold ${plan.score >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                        {plan.score}%
                      </p>
                    </div>
                  )}
                  <div className="w-24 text-center">
                    {getStatusBadge(plan.status)}
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

function Users({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
