import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, BookOpen, FileText, UserCircle, DollarSign, Package, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface UnitSettings {
  id: string;
  name: string;
  code: string;
  type: string;
  moduloPedagogico: boolean;
  moduloDiario: boolean;
  moduloCRM: boolean;
  moduloFinanceiro: boolean;
  moduloSuprimentos: boolean;
}

export default function Configuracoes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<UnitSettings | null>(null);

  // Estados dos módulos
  const [moduloPedagogico, setModuloPedagogico] = useState(true);
  const [moduloDiario, setModuloDiario] = useState(true);
  const [moduloCRM, setModuloCRM] = useState(false);
  const [moduloFinanceiro, setModuloFinanceiro] = useState(false);
  const [moduloSuprimentos, setModuloSuprimentos] = useState(true);

  // Carregar configurações da unidade atual
  useEffect(() => {
    loadUnitSettings();
  }, []);

  const loadUnitSettings = async () => {
    try {
      setLoading(true);
      
      // TODO: Obter unitId do contexto de autenticação
      // Por enquanto, vamos buscar a primeira unidade disponível
      const response = await fetch('/api/unit-settings');
      const units = await response.json();
      
      if (units && units.length > 0) {
        const unit = units[0]; // Primeira unidade
        setCurrentUnit(unit);
        
        // Atualizar estados dos switches
        setModuloPedagogico(unit.moduloPedagogico);
        setModuloDiario(unit.moduloDiario);
        setModuloCRM(unit.moduloCRM);
        setModuloFinanceiro(unit.moduloFinanceiro);
        setModuloSuprimentos(unit.moduloSuprimentos);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateModuleSetting = async (moduleName: string, value: boolean) => {
    if (!currentUnit) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/unit-settings/${currentUnit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [moduleName]: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar configuração');
      }

      const updatedUnit = await response.json();
      setCurrentUnit(updatedUnit);

      toast({
        title: "Configuração atualizada",
        description: `Módulo ${value ? 'ativado' : 'desativado'} com sucesso`,
      });

      // Recarregar a página após 1 segundo para aplicar mudanças no menu
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive",
      });
      
      // Reverter o estado do switch
      loadUnitSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleModuloPedagogicoChange = (value: boolean) => {
    setModuloPedagogico(value);
    updateModuleSetting('moduloPedagogico', value);
  };

  const handleModuloDiarioChange = (value: boolean) => {
    setModuloDiario(value);
    updateModuleSetting('moduloDiario', value);
  };

  const handleModuloCRMChange = (value: boolean) => {
    setModuloCRM(value);
    updateModuleSetting('moduloCRM', value);
  };

  const handleModuloFinanceiroChange = (value: boolean) => {
    setModuloFinanceiro(value);
    updateModuleSetting('moduloFinanceiro', value);
  };

  const handleModuloSuprimentosChange = (value: boolean) => {
    setModuloSuprimentos(value);
    updateModuleSetting('moduloSuprimentos', value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do sistema e módulos ativos
        </p>
        {currentUnit && (
          <p className="text-sm text-muted-foreground mt-1">
            Unidade atual: <span className="font-semibold">{currentUnit.name}</span> ({currentUnit.type})
          </p>
        )}
      </div>

      <Separator />

      {/* Módulos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Módulos</CardTitle>
          <CardDescription>
            Ative ou desative módulos do sistema. As alterações serão aplicadas imediatamente no menu lateral.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Os módulos desativados não aparecerão no menu lateral. A página será recarregada após cada alteração.
            </AlertDescription>
          </Alert>

          {/* Módulo Pedagógico */}
          <div className="flex items-center justify-between space-x-4 p-4 border border-border rounded-lg">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modulo-pedagogico" className="text-base font-semibold cursor-pointer">
                  Módulo Pedagógico
                </Label>
                <p className="text-sm text-muted-foreground">
                  Planejamentos, atividades BNCC e gestão pedagógica
                </p>
              </div>
            </div>
            <Switch
              id="modulo-pedagogico"
              checked={moduloPedagogico}
              onCheckedChange={handleModuloPedagogicoChange}
              disabled={saving}
            />
          </div>

          {/* Módulo Diário */}
          <div className="flex items-center justify-between space-x-4 p-4 border border-border rounded-lg">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modulo-diario" className="text-base font-semibold cursor-pointer">
                  Módulo Diário de Bordo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Registro diário de atividades, alimentação e desenvolvimento
                </p>
              </div>
            </div>
            <Switch
              id="modulo-diario"
              checked={moduloDiario}
              onCheckedChange={handleModuloDiarioChange}
              disabled={saving}
            />
          </div>

          {/* Módulo Suprimentos */}
          <div className="flex items-center justify-between space-x-4 p-4 border border-border rounded-lg">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modulo-suprimentos" className="text-base font-semibold cursor-pointer">
                  Módulo Suprimentos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Gestão de estoque, pedidos e controle de materiais
                </p>
              </div>
            </div>
            <Switch
              id="modulo-suprimentos"
              checked={moduloSuprimentos}
              onCheckedChange={handleModuloSuprimentosChange}
              disabled={saving}
            />
          </div>

          <Separator />

          {/* CRM 360º */}
          <div className="flex items-center justify-between space-x-4 p-4 border border-border rounded-lg">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modulo-crm" className="text-base font-semibold cursor-pointer">
                  CRM 360º - Gestão de Clientes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sistema completo de gestão de relacionamento com clientes e alunos
                </p>
              </div>
            </div>
            <Switch
              id="modulo-crm"
              checked={moduloCRM}
              onCheckedChange={handleModuloCRMChange}
              disabled={saving}
            />
          </div>

          {/* Painel Financeiro */}
          <div className="flex items-center justify-between space-x-4 p-4 border border-border rounded-lg">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modulo-financeiro" className="text-base font-semibold cursor-pointer">
                  Painel Financeiro Inteligente
                </Label>
                <p className="text-sm text-muted-foreground">
                  Gestão financeira completa com análises e relatórios automáticos
                </p>
              </div>
            </div>
            <Switch
              id="modulo-financeiro"
              checked={moduloFinanceiro}
              onCheckedChange={handleModuloFinanceiroChange}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Outras Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Personalize o comportamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificacoes">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas importantes por email
              </p>
            </div>
            <Switch id="notificacoes" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="modo-compacto">Modo Compacto</Label>
              <p className="text-sm text-muted-foreground">
                Reduz o espaçamento da interface
              </p>
            </div>
            <Switch id="modo-compacto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
