import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Calendar,
  FileText,
  Package,
  BookOpen,
  Heart,
  Settings,
  ChevronDown,
  Menu,
  X,
  Zap,
  Eye,
  Home,
  ClipboardList,
  Brain,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Visão Geral",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    label: "Alunos Gerais",
    icon: <Users className="h-5 w-5" />,
    submenu: [
      { label: "Agenda Geral", icon: <Calendar className="h-4 w-4" />, href: "/dashboard/agenda-geral" },
      { label: "Agenda Digital", icon: <Calendar className="h-4 w-4" />, href: "/dashboard/agenda-digital" },
      { label: "Dados do Aluno", icon: <FileText className="h-4 w-4" />, href: "/dashboard/dados-aluno" },
      { label: "Atendimento Psi", icon: <Brain className="h-4 w-4" />, href: "/dashboard/atendimento-psi" },
      { label: "Pedidos Materiais", icon: <Package className="h-4 w-4" />, href: "/dashboard/pedidos-materiais" },
      { label: "Biblioteca Geral", icon: <BookOpen className="h-4 w-4" />, href: "/dashboard/biblioteca" },
      { label: "Atividades CAM", icon: <Zap className="h-4 w-4" />, href: "/dashboard/atividades-cam" },
      { label: "Frequência", icon: <ClipboardList className="h-4 w-4" />, href: "/dashboard/frequencia" },
      { label: "Alunos", icon: <Users className="h-4 w-4" />, href: "/dashboard/alunos" },
      { label: "Saúde", icon: <Heart className="h-4 w-4" />, href: "/dashboard/saude" },
      { label: "Turmas", icon: <Users className="h-4 w-4" />, href: "/dashboard/turmas" },
    ],
  },
  {
    label: "Funcionários",
    icon: <Users className="h-5 w-5" />,
    href: "/dashboard/funcionarios",
  },
  {
    label: "Estoque",
    icon: <Package className="h-5 w-5" />,
    href: "/dashboard/estoque",
  },
  {
    label: "Pedidos por Turma",
    icon: <FileText className="h-5 w-5" />,
    href: "/dashboard/pedidos-turma",
  },
  {
    label: "Automação (Dados)",
    icon: <Zap className="h-5 w-5" />,
    href: "/dashboard/automacao",
  },
  {
    label: "Visualização do Projeto",
    icon: <Eye className="h-5 w-5" />,
    href: "/dashboard/visualizacao",
  },
  {
    label: "Configuração",
    icon: <Settings className="h-5 w-5" />,
    href: "/dashboard/configuracao",
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>("Alunos Gerais");
  const [location] = useLocation();

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const isActive = (href?: string) => {
    return href && location.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link href="/">
            <a className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-xl">CONEXA</span>
            </a>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 text-left ${
                      expandedMenu === item.label ? "bg-slate-800" : ""
                    }`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedMenu === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {/* Submenu */}
                  {expandedMenu === item.label && (
                    <div className="ml-6 mt-2 space-y-1 border-l border-slate-700 pl-3">
                      {item.submenu.map((subitem) => (
                        <Link key={subitem.label} href={subitem.href || "#"}>
                          <a
                            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                              isActive(subitem.href)
                                ? "bg-blue-500 text-white"
                                : "text-slate-300 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            {subitem.icon}
                            {subitem.label}
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href || "#"}>
                  <a
                    className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-500 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Offset */}
      <div className="md:ml-64" />
    </>
  );
}
