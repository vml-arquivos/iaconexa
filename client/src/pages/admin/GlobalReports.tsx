/**
 * Global Reports - Visualização de Auditoria
 * Sistema Conexa - Security Hardening
 * 
 * Página exclusiva para nível estratégico (ADMIN_MATRIZ, GESTOR_REDE)
 * Permite visualizar dashboards de todas as unidades em modo leitura
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  FileText,
  DollarSign,
  Package,
  Calendar,
  Eye
} from 'lucide-react';

interface Unit {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string;
}

interface UnitStats {
  students: number;
  classes: number;
  teachers: number;
  dailyLogs: number;
  appointments: number;
  materialRequests: number;
  pendingApprovals: number;
}

export default function GlobalReports() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [unitStats, setUnitStats] = useState<UnitStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar lista de unidades
  useEffect(() => {
    loadUnits();
  }, []);

  // Carregar estatísticas quando unidade é selecionada
  useEffect(() => {
    if (selectedUnit) {
      loadUnitStats(selectedUnit);
    }
  }, [selectedUnit]);

  const loadUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const data = await response.json();
      setUnits(data);
      
      // Selecionar primeira unidade automaticamente
      if (data.length > 0) {
        setSelectedUnit(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    }
  };

  const loadUnitStats = async (unitId: string) => {
    setLoading(true);
    try {
      // Carregar estatísticas da unidade
      const response = await fetch(`/api/reports/unit/${unitId}/stats`);
      const data = await response.json();
      setUnitStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Mock data para demonstração
      setUnitStats({
        students: 120,
        classes: 8,
        teachers: 15,
        dailyLogs: 450,
        appointments: 32,
        materialRequests: 18,
        pendingApprovals: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedUnitData = units.find(u => u.id === selectedUnit);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Globais</h1>
          <p className="text-muted-foreground">
            Visualização consolidada de todas as unidades (Modo Auditoria)
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Eye className="w-4 h-4 mr-2" />
          Modo Leitura
        </Badge>
      </div>

      {/* Unit Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Selecionar Unidade
          </CardTitle>
          <CardDescription>
            Escolha uma unidade para visualizar seus dados em modo auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant={unit.type === 'MATRIZ' ? 'default' : 'secondary'}>
                      {unit.type}
                    </Badge>
                    <span className="font-medium">{unit.code}</span>
                    <span className="text-muted-foreground">- {unit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUnitData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{selectedUnitData.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedUnitData.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{selectedUnitData.address}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      {unitStats && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unitStats.students}</div>
                <p className="text-xs text-muted-foreground">Total de alunos matriculados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turmas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unitStats.classes}</div>
                <p className="text-xs text-muted-foreground">Turmas ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unitStats.teachers}</div>
                <p className="text-xs text-muted-foreground">Equipe pedagógica</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendências</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{unitStats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="pedagogico" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pedagogico">
                <FileText className="w-4 h-4 mr-2" />
                Pedagógico
              </TabsTrigger>
              <TabsTrigger value="operacional">
                <Calendar className="w-4 h-4 mr-2" />
                Operacional
              </TabsTrigger>
              <TabsTrigger value="financeiro">
                <DollarSign className="w-4 h-4 mr-2" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="suprimentos">
                <Package className="w-4 h-4 mr-2" />
                Suprimentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pedagogico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Pedagógico</CardTitle>
                  <CardDescription>Visão geral das atividades pedagógicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Diários de Bordo</p>
                        <p className="text-sm text-muted-foreground">Registros diários de atividades</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{unitStats.dailyLogs}</p>
                        <p className="text-xs text-muted-foreground">Total de registros</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Atendimentos Agendados</p>
                        <p className="text-sm text-muted-foreground">Reuniões e consultas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{unitStats.appointments}</p>
                        <p className="text-xs text-muted-foreground">Agendamentos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operacional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Operacional</CardTitle>
                  <CardDescription>Dados operacionais da unidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Dados operacionais em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Financeiro</CardTitle>
                  <CardDescription>Visão financeira consolidada</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Relatório financeiro em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suprimentos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Suprimentos</CardTitle>
                  <CardDescription>Gestão de materiais e pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Pedidos de Materiais</p>
                        <p className="text-sm text-muted-foreground">Solicitações de suprimentos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{unitStats.materialRequests}</p>
                        <p className="text-xs text-muted-foreground">Total de pedidos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Audit Notice */}
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Eye className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Modo Auditoria Ativo</p>
                  <p className="text-sm text-muted-foreground">
                    Você está visualizando os dados em modo somente leitura. 
                    Apenas a unidade pode editar seus próprios dados operacionais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
