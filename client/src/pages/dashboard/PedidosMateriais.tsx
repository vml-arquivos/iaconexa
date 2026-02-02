// ========================================
// SISTEMA CONEXA v1.0
// Pedidos de Materiais - Interface Consolidada
// ========================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShoppingCart,
  FileText,
  User,
  AlertCircle
} from 'lucide-react';

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
  userRel: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
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

export default function PedidosMateriais() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [myRequests, setMyRequests] = useState<MaterialRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MaterialRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    category: 'HIGIENE',
    itemName: '',
    quantity: 1,
    unit: 'un',
    notes: '',
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchMyRequests();
      fetchPendingRequests();
      fetchApprovedRequests();
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

  const fetchMyRequests = async () => {
    try {
      const userId = 'current-user-id'; // Em produção, pegar do contexto
      const response = await fetch(`/api/material-requests?unitId=${selectedUnit}`);
      const result = await response.json();
      if (result.success) {
        // Filtrar apenas meus pedidos (em produção, filtrar por userId)
        setMyRequests(result.data.slice(0, 5)); // Últimos 5
      }
    } catch (error) {
      console.error('Erro ao buscar meus pedidos:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = 'current-user-id'; // Em produção, pegar do contexto

      const response = await fetch('/api/material-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unitId: selectedUnit,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        resetForm();
        fetchMyRequests();
        alert('Pedido criado com sucesso!');
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Deseja aprovar este pedido?')) return;

    try {
      const approvedBy = 'current-user-id'; // Em produção, pegar do contexto

      const response = await fetch(`/api/material-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy }),
      });

      const result = await response.json();

      if (result.success) {
        fetchPendingRequests();
        fetchApprovedRequests();
        alert('Pedido aprovado com sucesso!');
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
        setRejecting(null);
        setRejectionReason('');
        fetchPendingRequests();
        alert('Pedido rejeitado');
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error);
      alert('Erro ao rejeitar pedido');
    }
  };

  const generateShoppingList = () => {
    if (approvedRequests.length === 0) {
      alert('Nenhum pedido aprovado para gerar lista de compras');
      return;
    }

    // Agrupar por categoria
    const grouped = approvedRequests.reduce((acc, req) => {
      if (!acc[req.category]) {
        acc[req.category] = [];
      }
      acc[req.category].push(req);
      return acc;
    }, {} as Record<string, MaterialRequest[]>);

    // Gerar texto da lista
    let list = '=== LISTA DE COMPRAS ===\n\n';
    Object.entries(grouped).forEach(([category, items]) => {
      list += `${categoryLabels[category]}:\n`;
      items.forEach((item) => {
        list += `  - ${item.itemName}: ${item.quantity} ${item.unit}\n`;
      });
      list += '\n';
    });

    // Mostrar em alert (em produção, gerar PDF ou download)
    alert(list);
  };

  const resetForm = () => {
    setFormData({
      category: 'HIGIENE',
      itemName: '',
      quantity: 1,
      unit: 'un',
      notes: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Pedidos de Materiais</h1>

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

      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs defaultValue="solicitar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solicitar">
              <Package className="h-4 w-4 mr-2" />
              Solicitar
            </TabsTrigger>
            <TabsTrigger value="gestao">
              <CheckCircle className="h-4 w-4 mr-2" />
              Gestão
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SOLICITAR (Para Professores) */}
          <TabsContent value="solicitar" className="space-y-4 mt-4">
            {/* Formulário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Novo Pedido
                </CardTitle>
                <CardDescription>
                  Solicite materiais necessários para sua unidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemName">Nome do Item *</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="Ex: Papel higiênico, Sabonete, Arroz..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="un">Unidade (un)</SelectItem>
                          <SelectItem value="cx">Caixa (cx)</SelectItem>
                          <SelectItem value="pct">Pacote (pct)</SelectItem>
                          <SelectItem value="kg">Quilograma (kg)</SelectItem>
                          <SelectItem value="l">Litro (l)</SelectItem>
                          <SelectItem value="fardo">Fardo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Enviando...' : 'Solicitar Material'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Meus Pedidos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meus Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {myRequests.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Você ainda não fez nenhum pedido.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {myRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{request.itemName}</p>
                          <p className="text-xs text-gray-500">
                            {categoryLabels[request.category]} • {request.quantity} {request.unit}
                          </p>
                        </div>
                        <Badge className={statusColors[request.status]} variant="secondary">
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: GESTÃO (Para Direção/Coordenação) */}
          <TabsContent value="gestao" className="space-y-4 mt-4">
            {/* Botão Gerar Lista de Compras */}
            <Button
              onClick={generateShoppingList}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={approvedRequests.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Lista de Compras ({approvedRequests.length} itens)
            </Button>

            {/* Pedidos Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pedidos Pendentes ({pendingRequests.length})
                </CardTitle>
                <CardDescription>
                  Aprove ou rejeite pedidos de materiais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum pedido pendente de aprovação.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold">{request.itemName}</h3>
                              <p className="text-sm text-gray-500">
                                {categoryLabels[request.category]} • {request.quantity} {request.unit}
                              </p>
                            </div>
                            <Badge className={statusColors[request.status]} variant="secondary">
                              {statusLabels[request.status]}
                            </Badge>
                          </div>

                          {request.notes && (
                            <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                              {request.notes}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                            <User className="h-3 w-3" />
                            <span>{request.userRel.name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(request.requestedAt).toLocaleDateString('pt-BR')}</span>
                          </div>

                          {rejecting === request.id ? (
                            <div className="space-y-2">
                              <Label htmlFor={`reject-${request.id}`}>Motivo da Rejeição *</Label>
                              <Textarea
                                id={`reject-${request.id}`}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explique por que este pedido está sendo rejeitado..."
                                rows={2}
                              />
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
                                    setRejecting(null);
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
                                onClick={() => setRejecting(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pedidos Aprovados (Lista de Compras) */}
            {approvedRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    Aprovados - Aguardando Compra ({approvedRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {approvedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{request.itemName}</p>
                          <p className="text-xs text-gray-600">
                            {categoryLabels[request.category]} • {request.quantity} {request.unit}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Solicitado por: {request.userRel.name}
                          </p>
                        </div>
                        <Badge className={statusColors[request.status]} variant="secondary">
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
