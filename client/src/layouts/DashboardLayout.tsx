import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Zap,
  GraduationCap,
  FileText,
  Package,
  UserCircle,
  DollarSign,
  ClipboardList,
  CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UnitSettings {
  moduloPedagogico: boolean;
  moduloDiario: boolean;
  moduloCRM: boolean;
  moduloFinanceiro: boolean;
  moduloSuprimentos: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unitSettings, setUnitSettings] = useState<UnitSettings>({
    moduloPedagogico: true,
    moduloDiario: true,
    moduloCRM: false,
    moduloFinanceiro: false,
    moduloSuprimentos: true,
  });

  // Carregar configurações da unidade
  useEffect(() => {
    loadUnitSettings();
  }, []);

  const loadUnitSettings = async () => {
    try {
      const response = await fetch('/api/unit-settings');
      const units = await response.json();
      
      if (units && units.length > 0) {
        const unit = units[0]; // Primeira unidade
        setUnitSettings({
          moduloPedagogico: unit.moduloPedagogico,
          moduloDiario: unit.moduloDiario,
          moduloCRM: unit.moduloCRM,
          moduloFinanceiro: unit.moduloFinanceiro,
          moduloSuprimentos: unit.moduloSuprimentos,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da unidade:', error);
    }
  };

  // Menu items base (sempre visíveis)
  const baseMenuItems = [
    { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
  ];

  // Menu items condicionais baseados em feature flags
  const conditionalMenuItems = [
    ...(unitSettings.moduloPedagogico ? [
      { icon: BookOpen, label: "Planejamentos", href: "/dashboard/planejamentos" },
      { icon: CheckSquare, label: "Tarefas", href: "/dashboard/tarefas" },
      { icon: GraduationCap, label: "Turmas", href: "/dashboard/turmas" },
    ] : []),
    ...(unitSettings.moduloDiario ? [
      { icon: FileText, label: "Diário de Bordo", href: "/dashboard/diario-rapido" },
      { icon: ClipboardList, label: "Diário Digital", href: "/dashboard/diario-digital" },
      { icon: ClipboardList, label: "Diário de Classe", href: "/dashboard/diario-classe" },
      { icon: CalendarCheck, label: "Agenda", href: "/dashboard/agenda-atendimentos" },
    ] : []),
    ...(unitSettings.moduloSuprimentos ? [
      { icon: Package, label: "Suprimentos", href: "/dashboard/materiais" },
    ] : []),
    { icon: Zap, label: "Automação (Demo)", href: "/dashboard/automacao" },
  ];

  // Menu items administrativos (CRM e Financeiro)
  const adminMenuItems = [
    ...(unitSettings.moduloCRM ? [
      { icon: UserCircle, label: "CRM 360º", href: "/admin/clients" },
    ] : []),
    ...(unitSettings.moduloFinanceiro ? [
      { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
    ] : []),
  ];

  const allMenuItems = [...baseMenuItems, ...conditionalMenuItems];
  const hasAdminItems = adminMenuItems.length > 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="h-20 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <span className="text-primary-foreground font-bold font-display text-xl">C</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">CONEXA</span>
        </div>

        <nav className="p-4 space-y-2">
          {/* Menu Principal */}
          {allMenuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.label}
                </a>
              </Link>
            );
          })}

          {/* Menu Administrativo (se houver itens) */}
          {hasAdminItems && (
            <>
              <div className="my-4 border-t border-border" />
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administração
              </div>
              {adminMenuItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? "bg-primary/10 text-primary font-medium shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </>
          )}

          {/* Separador */}
          <div className="my-4 border-t border-border" />

          {/* Configurações */}
          <Link href="/dashboard/configuracoes">
            <a className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${location === '/dashboard/configuracoes'
                ? "bg-primary/10 text-primary font-medium shadow-sm" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }
            `}>
              <Settings className="w-5 h-5" />
              Configurações
            </a>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link href="/">
            <a className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              Sair
            </a>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="hidden md:flex items-center gap-2 text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50">
              <Search className="w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">Ana Silva</p>
                <p className="text-xs text-muted-foreground">Coordenadora</p>
              </div>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content - Desktop First com max-w-7xl */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-secondary/30">
          <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
