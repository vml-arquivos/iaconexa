import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function Overview() {
  const stats = [
    { label: "Planejamentos Ativos", value: "12", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Aprovados (Mês)", value: "45", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Pendentes Análise", value: "3", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Revisão Necessária", value: "1", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const recentActivity = [
    { user: "Carlos Eduardo", action: "submeteu planejamento", target: "Matemática 5º Ano", time: "2 min atrás", status: "pending" },
    { user: "CONEXA AI AI", action: "aprovou automaticamente", target: "História 3º Ano", time: "15 min atrás", status: "approved" },
    { user: "Mariana Costa", action: "editou tarefa", target: "Feira de Ciências", time: "1h atrás", status: "neutral" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, Ana. Aqui está o resumo de hoje.</p>
        </div>
        <Link href="/dashboard/planejamentos/novo">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Novo Planejamento
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold font-display">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atividade Recente</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">Ver tudo</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-6 border-b border-border/40 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-500' : 
                    activity.status === 'pending' ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-primary">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  {activity.status === 'pending' && (
                    <Button size="sm" variant="outline" className="h-8 text-xs">Revisar</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / AI Insights */}
        <Card className="bg-primary/5 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Insights CONEXA AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Sugestão de Otimização</p>
              <p className="text-sm font-medium text-foreground">
                3 turmas do 5º ano estão com atraso no conteúdo de Frações. Sugiro aplicar a atividade de reforço #42.
              </p>
              <Button size="sm" variant="link" className="px-0 text-primary mt-2 h-auto">
                Ver Atividade <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Alerta de Qualidade</p>
              <p className="text-sm font-medium text-foreground">
                O planejamento de Geografia (Prof. Marcos) atingiu 98% de score BNCC.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
