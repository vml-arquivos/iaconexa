import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus, TrendingUp, Users, Package, AlertCircle } from "lucide-react";

interface DashboardStats {
  planejamentosAtivos: number;
  agendadosMes: number;
  pendentesAnalise: number;
  servicoNecessario: number;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "student" | "employee" | "inventory" | "order";
}

const chartData = [
  { month: "Jan", students: 120, employees: 45, orders: 30 },
  { month: "Fev", students: 135, employees: 48, orders: 35 },
  { month: "Mar", students: 145, employees: 50, orders: 40 },
  { month: "Abr", students: 155, employees: 52, orders: 45 },
  { month: "Mai", students: 165, employees: 55, orders: 50 },
  { month: "Jun", students: 175, employees: 58, orders: 55 },
];

const pieData = [
  { name: "Pedagógico", value: 35 },
  { name: "Higiene", value: 25 },
  { name: "Alimentação", value: 40 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    title: "Novo Aluno Registrado",
    description: "João Silva foi adicionado à turma 5º Ano A",
    timestamp: "há 2 horas",
    type: "student",
  },
  {
    id: "2",
    title: "Funcionário Arquivado",
    description: "Maria Santos foi arquivada do sistema",
    timestamp: "há 4 horas",
    type: "employee",
  },
  {
    id: "3",
    title: "Estoque Baixo",
    description: "Papel A4 está com quantidade baixa (5 resmas)",
    timestamp: "há 6 horas",
    type: "inventory",
  },
  {
    id: "4",
    title: "Pedido Criado",
    description: "Novo pedido de materiais para 5º Ano A",
    timestamp: "há 8 horas",
    type: "order",
  },
];

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    planejamentosAtivos: 12,
    agendadosMes: 45,
    pendentesAnalise: 3,
    servicoNecessario: 1,
  });

  const [activities, setActivities] = useState<RecentActivity[]>(recentActivities);

  useEffect(() => {
    // Aqui você pode fazer fetch dos dados reais
    // const fetchStats = async () => {
    //   const response = await fetch('/api/dashboard/stats');
    //   const data = await response.json();
    //   setStats(data);
    // };
    // fetchStats();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "student":
        return "👨‍🎓";
      case "employee":
        return "👨‍💼";
      case "inventory":
        return "📦";
      case "order":
        return "📋";
      default:
        return "📌";
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-600 mt-2">Bem-vindo ao CONEXA - Gestão Escolar Inteligente</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Novo Planejamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-600 text-sm font-medium">Planejamentos Ativos</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{stats.planejamentosAtivos}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">↑ 12% vs mês anterior</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-600 text-sm font-medium">Agendados (Mês)</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.agendadosMes}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">↑ 8% vs mês anterior</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-600 text-sm font-medium">Pendentes Análise</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pendentesAnalise}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">Requer atenção</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-600 text-sm font-medium">Serviço Necessário</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{stats.servicoNecessario}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <Package className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">Urgente</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendência Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" name="Alunos" />
              <Line type="monotone" dataKey="employees" stroke="#10b981" name="Funcionários" />
              <Line type="monotone" dataKey="orders" stroke="#f59e0b" name="Pedidos" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribuição de Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Análise Comparativa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#3b82f6" name="Alunos" />
            <Bar dataKey="employees" fill="#10b981" name="Funcionários" />
            <Bar dataKey="orders" fill="#f59e0b" name="Pedidos" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{activity.title}</p>
                <p className="text-sm text-slate-600">{activity.description}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">💡 Insights & Recomendações</h3>
        <div className="space-y-3">
          <p className="text-slate-700">
            • <strong>Estoque Baixo:</strong> Papel A4 está com quantidade crítica. Considere fazer um pedido de reposição.
          </p>
          <p className="text-slate-700">
            • <strong>Frequência:</strong> 2 alunos com alta taxa de faltas. Recomenda-se contato com responsáveis.
          </p>
          <p className="text-slate-700">
            • <strong>Planejamento:</strong> 3 planejamentos pendentes de análise. Revise-os para manter o sistema atualizado.
          </p>
        </div>
      </Card>
    </div>
  );
}
