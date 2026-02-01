import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Archive, 
  Search, 
  Plus, 
  User, 
  DollarSign, 
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Send
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ==========================================
// INTERFACES
// ==========================================

interface Guardian {
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  enrollmentId?: string;
  status: string;
  classId?: string;
  schoolId?: string;
  guardians?: Guardian[];
  profileData?: any;
  healthData?: any;
  class?: { id: string; name: string; level?: string };
  school?: { id: string; name: string };
}

interface FinancialRecord {
  id: string;
  type: 'MENSALIDADE' | 'MATERIAL' | 'EVENTO' | 'TAXA' | 'OUTROS';
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'CANCELADO';
  month?: number;
  year?: number;
}

interface WhatsAppMessage {
  id: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  timestamp: string;
  status?: string;
}

// ==========================================
// MOCK DATA (Substituir por API real)
// ==========================================

const mockFinancialRecords: FinancialRecord[] = [
  { id: '1', type: 'MENSALIDADE', description: 'Mensalidade Janeiro/2026', amount: 1200.00, dueDate: '2026-01-10', paidDate: '2026-01-08', status: 'PAGO', month: 1, year: 2026 },
  { id: '2', type: 'MENSALIDADE', description: 'Mensalidade Fevereiro/2026', amount: 1200.00, dueDate: '2026-02-10', status: 'PENDENTE', month: 2, year: 2026 },
  { id: '3', type: 'MATERIAL', description: 'Material Didático 1º Semestre', amount: 450.00, dueDate: '2026-01-15', paidDate: '2026-01-15', status: 'PAGO' },
  { id: '4', type: 'EVENTO', description: 'Excursão Museu', amount: 80.00, dueDate: '2026-03-20', status: 'PENDENTE' },
  { id: '5', type: 'MENSALIDADE', description: 'Mensalidade Dezembro/2025', amount: 1200.00, dueDate: '2025-12-10', status: 'ATRASADO', month: 12, year: 2025 },
];

const mockWhatsAppMessages: WhatsAppMessage[] = [
  { id: '1', direction: 'incoming', content: 'Olá, gostaria de saber sobre a mensalidade de dezembro.', timestamp: '2025-12-15T10:30:00' },
  { id: '2', direction: 'outgoing', content: 'Bom dia! A mensalidade de dezembro está em aberto. O valor é R$ 1.200,00 com vencimento dia 10/12.', timestamp: '2025-12-15T10:35:00' },
  { id: '3', direction: 'incoming', content: 'Posso pagar até dia 20?', timestamp: '2025-12-15T10:40:00' },
  { id: '4', direction: 'outgoing', content: 'Sim, podemos negociar. Haverá uma multa de 2% após o vencimento.', timestamp: '2025-12-15T10:45:00' },
  { id: '5', direction: 'incoming', content: 'Ok, vou pagar amanhã. Obrigado!', timestamp: '2025-12-15T10:50:00' },
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

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// ==========================================
// COMPONENTE PRINCIPAL - LISTA DE CLIENTES
// ==========================================

function ClientList({ onSelectClient }: { onSelectClient: (id: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    const matchesClass = filterClass === "all" || student.classId === filterClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map(s => s.classId).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-2">CRM 360º - Alunos e Responsáveis</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
                <SelectItem value="ARCHIVED">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Turmas</SelectItem>
                {uniqueClasses.map(classId => (
                  <SelectItem key={classId} value={classId!}>{classId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card 
            key={student.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectClient(student.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{student.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {student.class?.name || student.classId || "Sem turma"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {student.status === 'ACTIVE' ? 'Ativo' : student.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{student.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{student.enrollmentId || "-"}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Clique para ver detalhes</span>
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE - DETALHES DO CLIENTE (CRM 360º)
// ==========================================

function ClientDetails({ clientId, onBack }: { clientId: string; onBack: () => void }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("perfil");
  const [financialRecords] = useState<FinancialRecord[]>(mockFinancialRecords);
  const [whatsappMessages] = useState<WhatsAppMessage[]>(mockWhatsAppMessages);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchStudent();
  }, [clientId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      }
    } catch (error) {
      console.error("Erro ao buscar aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos financeiros
  const totalPago = financialRecords.filter(r => r.status === 'PAGO').reduce((sum, r) => sum + r.amount, 0);
  const totalPendente = financialRecords.filter(r => r.status === 'PENDENTE').reduce((sum, r) => sum + r.amount, 0);
  const totalAtrasado = financialRecords.filter(r => r.status === 'ATRASADO').reduce((sum, r) => sum + r.amount, 0);
  const isInadimplente = totalAtrasado > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Cliente não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse guardians
  const guardians: Guardian[] = Array.isArray(student.guardians) 
    ? student.guardians 
    : (student.guardians ? [student.guardians] : []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {student.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground">
                {student.class?.name || "Sem turma"} • {student.school?.name || ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isInadimplente && (
            <Badge variant="destructive" className="gap-1 h-8">
              <AlertTriangle className="h-4 w-4" />
              Inadimplente
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Arquivar
          </Button>
        </div>
      </div>

      {/* Tabs CRM 360º */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="comunicacao" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
        </TabsList>

        {/* ==================== ABA PERFIL ==================== */}
        <TabsContent value="perfil" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados do Aluno */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Aluno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{student.cpf || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">
                      {student.birthDate ? formatDate(student.birthDate) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matrícula</p>
                    <p className="font-medium">{student.enrollmentId || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Turma</p>
                  <p className="font-medium">
                    {student.class?.name || "-"} {student.class?.level ? `(${student.class.level})` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Responsável Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Responsável Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guardians.length > 0 ? (
                  guardians.map((guardian, index) => (
                    <div key={index} className="space-y-4">
                      {index > 0 && <Separator />}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-medium">{guardian.name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Parentesco</p>
                          <p className="font-medium">{guardian.relationship || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CPF</p>
                          <p className="font-medium">{guardian.cpf || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{guardian.email || "-"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Telefone (WhatsApp)</p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <p className="font-medium">{guardian.phone || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum responsável cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informações de Saúde */}
          {student.healthData && (
            <Card>
              <CardHeader>
                <CardTitle>Informações de Saúde</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(student.healthData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== ABA FINANCEIRO ==================== */}
        <TabsContent value="financeiro" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pago</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
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
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendente)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={isInadimplente ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Atraso</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAtrasado)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Lançamentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico Financeiro</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Lançamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell><TypeBadge type={record.type} /></TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                      <TableCell>{formatDate(record.dueDate)}</TableCell>
                      <TableCell>{record.paidDate ? formatDate(record.paidDate) : "-"}</TableCell>
                      <TableCell><StatusBadge status={record.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ABA COMUNICAÇÃO (N8N) ==================== */}
        <TabsContent value="comunicacao" className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">WhatsApp</CardTitle>
                    <CardDescription>
                      {guardians[0]?.phone || "Telefone não cadastrado"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Conectado via N8N
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Área de Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {whatsappMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === 'outgoing'
                            ? 'bg-green-500 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.direction === 'outgoing' ? 'text-green-100' : 'text-muted-foreground'
                        }`}>
                          {formatDateTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de Nova Mensagem */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Enviar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Mensagens enviadas via integração N8N/WhatsApp Business API
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==========================================
// COMPONENTE EXPORTADO
// ==========================================

export default function ClientManagement() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  if (selectedClientId) {
    return (
      <ClientDetails 
        clientId={selectedClientId} 
        onBack={() => setSelectedClientId(null)} 
      />
    );
  }

  return <ClientList onSelectClient={setSelectedClientId} />;
}
