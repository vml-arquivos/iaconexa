import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Users,
  GraduationCap,
  PieChart,
  BarChart3,
  RefreshCw,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ==========================================
// INTERFACES
// ==========================================

interface FinancialRecord {
  id: string;
  studentId: string;
  studentName: string;
  guardianName: string;
  guardianPhone?: string;
  classId: string;
  className: string;
  classLevel?: string;
  type: 'MENSALIDADE' | 'MATERIAL' | 'EVENTO' | 'TAXA' | 'OUTROS';
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'CANCELADO';
  month?: number;
  year?: number;
}

interface FilterState {
  guardianId: string;
  classId: string;
  category: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  searchTerm: string;
}

interface ClassSummary {
  classId: string;
  className: string;
  level?: string;
  totalStudents: number;
  totalReceivable: number;
  totalReceived: number;
  totalOverdue: number;
  inadimplenciaRate: number;
}

interface GuardianSummary {
  guardianName: string;
  studentName: string;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

// ==========================================
// MOCK DATA (Substituir por API real)
// ==========================================

const mockFinancialRecords: FinancialRecord[] = [
  // Turma: Infantil 1
  { id: '1', studentId: 's1', studentName: 'Ana Silva', guardianName: 'João Silva', guardianPhone: '11999990001', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1200.00, dueDate: '2026-01-10', paidDate: '2026-01-08', status: 'PAGO', month: 1, year: 2026 },
  { id: '2', studentId: 's1', studentName: 'Ana Silva', guardianName: 'João Silva', guardianPhone: '11999990001', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MENSALIDADE', description: 'Mensalidade Fevereiro/2026', amount: 1200.00, dueDate: '2026-02-10', status: 'PENDENTE', month: 2, year: 2026 },
  { id: '3', studentId: 's2', studentName: 'Pedro Santos', guardianName: 'Maria Santos', guardianPhone: '11999990002', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1200.00, dueDate: '2026-01-10', status: 'ATRASADO', month: 1, year: 2026 },
  { id: '4', studentId: 's2', studentName: 'Pedro Santos', guardianName: 'Maria Santos', guardianPhone: '11999990002', classId: 'c1', className: 'Infantil 1', classLevel: 'Educação Infantil', type: 'MATERIAL', description: 'Material Didático', amount: 450.00, dueDate: '2026-01-15', paidDate: '2026-01-15', status: 'PAGO' },
  
  // Turma: 3º Ano
  { id: '5', studentId: 's3', studentName: 'Lucas Oliveira', guardianName: 'Carlos Oliveira', guardianPhone: '11999990003', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1500.00, dueDate: '2026-01-10', paidDate: '2026-01-10', status: 'PAGO', month: 1, year: 2026 },
  { id: '6', studentId: 's3', studentName: 'Lucas Oliveira', guardianName: 'Carlos Oliveira', guardianPhone: '11999990003', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Fevereiro/2026', amount: 1500.00, dueDate: '2026-02-10', status: 'PENDENTE', month: 2, year: 2026 },
  { id: '7', studentId: 's4', studentName: 'Julia Costa', guardianName: 'Roberto Costa', guardianPhone: '11999990004', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1500.00, dueDate: '2026-01-10', status: 'ATRASADO', month: 1, year: 2026 },
  { id: '8', studentId: 's4', studentName: 'Julia Costa', guardianName: 'Roberto Costa', guardianPhone: '11999990004', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'EVENTO', description: 'Excursão Museu', amount: 120.00, dueDate: '2026-03-20', status: 'PENDENTE' },
  { id: '9', studentId: 's5', studentName: 'Gabriel Ferreira', guardianName: 'Fernanda Ferreira', guardianPhone: '11999990005', classId: 'c2', className: '3º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1500.00, dueDate: '2026-01-10', status: 'ATRASADO', month: 1, year: 2026 },
  
  // Turma: 5º Ano
  { id: '10', studentId: 's6', studentName: 'Mariana Lima', guardianName: 'Paulo Lima', guardianPhone: '11999990006', classId: 'c3', className: '5º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1600.00, dueDate: '2026-01-10', paidDate: '2026-01-05', status: 'PAGO', month: 1, year: 2026 },
  { id: '11', studentId: 's6', studentName: 'Mariana Lima', guardianName: 'Paulo Lima', guardianPhone: '11999990006', classId: 'c3', className: '5º Ano', classLevel: 'Ensino Fundamental', type: 'TAXA', description: 'Taxa de Matrícula', amount: 300.00, dueDate: '2026-01-05', paidDate: '2026-01-05', status: 'PAGO' },
  { id: '12', studentId: 's7', studentName: 'Rafael Souza', guardianName: 'Amanda Souza', guardianPhone: '11999990007', classId: 'c3', className: '5º Ano', classLevel: 'Ensino Fundamental', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1600.00, dueDate: '2026-01-10', paidDate: '2026-01-10', status: 'PAGO', month: 1, year: 2026 },
];

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
    PAGO: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, label: "Pago" },
    PENDENTE: { variant: "secondary", icon: <Clock className="h-3 w-3" />, label: "Pendente" },
    ATRASADO: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" />, label: "Atrasado" },
    CANCELADO: { variant: "outline", icon: <XCircle className="h-3 w-3" />, label: "Cancelado" },
  };

  const { variant, icon, label } = config[status] || config.PENDENTE;

  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    MENSALIDADE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    MATERIAL: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    EVENTO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    TAXA: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    OUTROS: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };

  return (
    <Badge variant="outline" className={colors[type] || colors.OUTROS}>
      {type}
    </Badge>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function FinancialDashboard() {
  const [loading, setLoading] = useState(false);
  const [records] = useState<FinancialRecord[]>(mockFinancialRecords);
  const [filters, setFilters] = useState<FilterState>({
    guardianId: "all",
    classId: "all",
    category: "all",
    status: "all",
    dateFrom: undefined,
    dateTo: undefined,
    searchTerm: ""
  });

  // Listas únicas para filtros
  const uniqueGuardians = useMemo(() => 
    [...new Set(records.map(r => r.guardianName))].sort(),
    [records]
  );

  const uniqueClasses = useMemo(() => 
    [...new Map(records.map(r => [r.classId, { id: r.classId, name: r.className, level: r.classLevel }])).values()],
    [records]
  );

  const categories = ['MENSALIDADE', 'MATERIAL', 'EVENTO', 'TAXA', 'OUTROS'];

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesGuardian = filters.guardianId === "all" || record.guardianName === filters.guardianId;
      const matchesClass = filters.classId === "all" || record.classId === filters.classId;
      const matchesCategory = filters.category === "all" || record.type === filters.category;
      const matchesStatus = filters.status === "all" || record.status === filters.status;
      const matchesSearch = filters.searchTerm === "" || 
        record.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.guardianName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (filters.dateFrom) {
        matchesDate = matchesDate && new Date(record.dueDate) >= filters.dateFrom;
      }
      if (filters.dateTo) {
        matchesDate = matchesDate && new Date(record.dueDate) <= filters.dateTo;
      }

      return matchesGuardian && matchesClass && matchesCategory && matchesStatus && matchesSearch && matchesDate;
    });
  }, [records, filters]);

  // Cálculos de resumo
  const summary = useMemo(() => {
    const totalReceivable = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalReceived = filteredRecords.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + r.amount, 0);
    const totalPending = filteredRecords.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + r.amount, 0);
    const totalOverdue = filteredRecords.filter(r => r.status === 'ATRASADO').reduce((sum, r) => sum + r.amount, 0);
    const inadimplenciaRate = totalReceivable > 0 ? (totalOverdue / totalReceivable) * 100 : 0;

    return { totalReceivable, totalReceived, totalPending, totalOverdue, inadimplenciaRate };
  }, [filteredRecords]);

  // Resumo por turma
  const classSummaries = useMemo((): ClassSummary[] => {
    const classMap = new Map<string, ClassSummary>();

    records.forEach(record => {
      if (!classMap.has(record.classId)) {
        classMap.set(record.classId, {
          classId: record.classId,
          className: record.className,
          level: record.classLevel,
          totalStudents: 0,
          totalReceivable: 0,
          totalReceived: 0,
          totalOverdue: 0,
          inadimplenciaRate: 0
        });
      }

      const summary = classMap.get(record.classId)!;
      summary.totalReceivable += record.amount;
      if (record.status === 'PAGO') summary.totalReceived += record.amount;
      if (record.status === 'ATRASADO') summary.totalOverdue += record.amount;
    });

    // Calcular taxa de inadimplência
    classMap.forEach(summary => {
      summary.inadimplenciaRate = summary.totalReceivable > 0 
        ? (summary.totalOverdue / summary.totalReceivable) * 100 
        : 0;
      // Contar alunos únicos (simplificado)
      summary.totalStudents = records.filter(r => r.classId === summary.classId)
        .map(r => r.studentId)
        .filter((v, i, a) => a.indexOf(v) === i).length;
    });

    return Array.from(classMap.values()).sort((a, b) => b.inadimplenciaRate - a.inadimplenciaRate);
  }, [records]);

  // Resumo por responsável (quando filtrado)
  const guardianSummary = useMemo((): GuardianSummary | null => {
    if (filters.guardianId === "all") return null;

    const guardianRecords = records.filter(r => r.guardianName === filters.guardianId);
    if (guardianRecords.length === 0) return null;

    return {
      guardianName: filters.guardianId,
      studentName: guardianRecords[0].studentName,
      totalPaid: guardianRecords.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + r.amount, 0),
      totalPending: guardianRecords.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + r.amount, 0),
      totalOverdue: guardianRecords.filter(r => r.status === 'ATRASADO').reduce((sum, r) => sum + r.amount, 0),
    };
  }, [records, filters.guardianId]);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      guardianId: "all",
      classId: "all",
      category: "all",
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
      searchTerm: ""
    });
  };

  const hasActiveFilters = filters.guardianId !== "all" || 
    filters.classId !== "all" || 
    filters.category !== "all" || 
    filters.status !== "all" ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.searchTerm !== "";

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Financeiro</h1>
          <p className="text-muted-foreground mt-2">Gestão de mensalidades e cobranças</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setLoading(true)}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Receber</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalReceivable)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceived)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalPending)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={summary.totalOverdue > 0 ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOverdue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa: {formatPercent(summary.inadimplenciaRate)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Granulares */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Inteligentes
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno, responsável ou descrição..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Por Responsável */}
            <Select 
              value={filters.guardianId} 
              onValueChange={(value) => setFilters({ ...filters, guardianId: value })}
            >
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Responsáveis</SelectItem>
                {uniqueGuardians.map(guardian => (
                  <SelectItem key={guardian} value={guardian}>{guardian}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Por Turma/Série */}
            <Select 
              value={filters.classId} 
              onValueChange={(value) => setFilters({ ...filters, classId: value })}
            >
              <SelectTrigger>
                <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Turma/Série" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Turmas</SelectItem>
                {uniqueClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.level ? `(${cls.level})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Por Categoria */}
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Por Status */}
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="ATRASADO">Atrasado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Data Início */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Data Início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {/* Data Fim */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Data Fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Card de Resumo do Responsável (quando filtrado) */}
      {guardianSummary && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumo: {guardianSummary.guardianName}
            </CardTitle>
            <CardDescription>
              Responsável por: {guardianSummary.studentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(guardianSummary.totalPaid)}</p>
              </div>
              <div className="text-center p-4 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(guardianSummary.totalPending)}</p>
              </div>
              <div className="text-center p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Em Atraso</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(guardianSummary.totalOverdue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Lançamentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lançamentos Financeiros</CardTitle>
              <Badge variant="outline">{filteredRecords.length} registros</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.slice(0, 10).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.studentName}</p>
                        <p className="text-xs text-muted-foreground">{record.className}</p>
                      </div>
                    </TableCell>
                    <TableCell><TypeBadge type={record.type} /></TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                    <TableCell>{formatDate(record.dueDate)}</TableCell>
                    <TableCell><StatusBadge status={record.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRecords.length > 10 && (
              <div className="text-center mt-4">
                <Button variant="outline" size="sm">
                  Ver todos ({filteredRecords.length} registros)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inadimplência por Turma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Inadimplência por Turma
            </CardTitle>
            <CardDescription>
              Taxa de atraso por série
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {classSummaries.map((cls) => (
              <div key={cls.classId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cls.className}</p>
                    <p className="text-xs text-muted-foreground">{cls.totalStudents} alunos</p>
                  </div>
                  <Badge 
                    variant={cls.inadimplenciaRate > 20 ? "destructive" : cls.inadimplenciaRate > 10 ? "secondary" : "outline"}
                  >
                    {formatPercent(cls.inadimplenciaRate)}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      cls.inadimplenciaRate > 20 ? 'bg-red-500' : 
                      cls.inadimplenciaRate > 10 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(cls.inadimplenciaRate, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Recebido: {formatCurrency(cls.totalReceived)}</span>
                  <span>Atrasado: {formatCurrency(cls.totalOverdue)}</span>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
