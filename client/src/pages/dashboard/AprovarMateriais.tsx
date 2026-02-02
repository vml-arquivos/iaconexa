// ========================================
// SISTEMA CONEXA v1.0
// Gestão de Suprimentos - Aprovar Pedidos
// ========================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Package, ShoppingCart, Clock, User } from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface MaterialRequest {
  id: string;
  unitId: string;
  userId: string;
  category: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
  requestedAt: string;
  notes: string | null;
  rejectionReason: string | null;
  purchasedAt: string | null;
  userRel: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  purchased: number;
  total: number;
}

const categoryLabels: Record<string, string> = {
  HIGIENE: 'Higiene',
  LIMPEZA: 'Limpeza',
  ALIMENTACAO: 'Alimentação',
  PEDAGOGICO: 'Pedagógico',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  PURCHASED: 'Comprado',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PURCHASED: 'bg-blue-100 text-blue-800',
};

export default function AprovarMateriais() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [pendingRequests, setPendingRequests] = useState<MaterialRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<MaterialRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchPendingRequests();
      fetchApprovedRequests();
      fetchStats();
    }
  }, [selectedUnit]);

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      const uniqueUnits = Array.from(
        new Map(
          data
            .filter((s: any) => s.unit)
            .map((s: any) => [s.unit.id, s.unit])
        ).values()
      ) as Unit[];
      setUnits(uniqueUnits);
      if (uniqueUnits.length > 0) {
        setSelectedUnit(uniqueUnits[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`/api/material-requests/unit/${selectedUnit}/pending`);
      const result = await response.json();
      if (result.success) {
        setPendingRequests(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos pendentes:', error);
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch(`/api/material-requests/unit/${selectedUnit}/approved`);
      const result = await response.json();
      if (result.success) {
        setApprovedRequests(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos aprovados:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/material-requests/stats/${selectedUnit}`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Deseja aprovar este pedido?')) return;

    try {
      // Simular userId do aprovador (em produção, pegar do contexto)
      const approvedBy = 'current-user-id';

      const response = await fetch(`/api/material-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy }),
      });

      const result = await response.json();

      if (result.success) {
        fetchPendingRequests();
        fetchApprovedRequests();
        fetchStats();
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
      alert('Erro ao aprovar pedido');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      const response = await fetch(`/api/material-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });

      const result = await response.json();

      if (result.success) {
        setRejectingId(null);
        setRejectionReason('');
        fetchPendingRequests();
        fetchStats();
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error);
      alert('Erro ao rejeitar pedido');
    }
  };

  const handlePurchase = async (id: string) => {
    if (!confirm('Confirmar que este item foi comprado?')) return;

    try {
      const response = await fetch(`/api/material-requests/${id}/purchase`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (result.success) {
        fetchApprovedRequests();
        fetchStats();
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao marcar como comprado:', error);
      alert('Erro ao marcar como comprado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900">Aprovar Materiais</h1>
            <p className="text-sm text-gray-500">Gerencie pedidos de suprimentos</p>
          </div>

          {/* Seletor de Unidade */}
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                    <p className="text-xs text-gray-500">Aprovados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pendentes ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprovados ({approvedRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Pendentes */}
          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingRequests.length === 0 ? (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  Nenhum pedido pendente de aprovação.
                </AlertDescription>
              </Alert>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{request.itemName}</h3>
                        <p className="text-sm text-gray-500">
                          {categoryLabels[request.category]} • {request.quantity} {request.unit}
                        </p>
                      </div>
                      <Badge className={statusColors[request.status]} variant="secondary">
                        {statusLabels[request.status]}
                      </Badge>
                    </div>

                    {request.notes && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{request.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User className="h-4 w-4" />
                      <span>{request.userRel.name}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(request.requestedAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    {rejectingId === request.id ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`reject-${request.id}`}>Motivo da Rejeição *</Label>
                          <Textarea
                            id={`reject-${request.id}`}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explique por que este pedido está sendo rejeitado..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                            className="flex-1"
                          >
                            Confirmar Rejeição
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectingId(request.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Tab: Aprovados */}
          <TabsContent value="approved" className="mt-4 space-y-3">
            {approvedRequests.length === 0 ? (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  Nenhum pedido aprovado aguardando compra.
                </AlertDescription>
              </Alert>
            ) : (
              approvedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{request.itemName}</h3>
                        <p className="text-sm text-gray-500">
                          {categoryLabels[request.category]} • {request.quantity} {request.unit}
                        </p>
                      </div>
                      <Badge className={statusColors[request.status]} variant="secondary">
                        {statusLabels[request.status]}
                      </Badge>
                    </div>

                    {request.notes && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{request.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User className="h-4 w-4" />
                      <span>{request.userRel.name}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(request.requestedAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handlePurchase(request.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Marcar como Comprado
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
