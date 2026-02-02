import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, UserCircle, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Configuracoes() {
  const [moduloCRM, setModuloCRM] = useState(false);
  const [moduloFinanceiro, setModuloFinanceiro] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do sistema e módulos opcionais
        </p>
      </div>

      <Separator />

      {/* Módulos Opcionais */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos Opcionais</CardTitle>
          <CardDescription>
            Ative ou desative módulos adicionais do sistema conforme necessário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Os módulos desativados não aparecerão no menu lateral. Você pode ativá-los a qualquer momento.
            </AlertDescription>
          </Alert>

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
              onCheckedChange={setModuloCRM}
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
              onCheckedChange={setModuloFinanceiro}
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
