// ========================================
// SISTEMA CONEXA v1.0
// Gestão de Suprimentos - Solicitar Materiais
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
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

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
    name: string;
    email: string;
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

export default function SolicitarMateriais() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [myRequests, setMyRequests] = useState<MaterialRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      // Simular userId (em produção, pegar do contexto de autenticação)
      const userId = 'current-user-id';
      const response = await fetch(`/api/material-requests?unitId=${selectedUnit}`);
      const result = await response.json();
      if (result.success) {
        setMyRequests(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar meus pedidos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular userId (em produção, pegar do contexto de autenticação)
      const userId = 'current-user-id';

      const url = editingId
        ? `/api/material-requests/${editingId}`
        : '/api/material-requests';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unitId: selectedUnit,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchMyRequests();
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert('Erro ao salvar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request: MaterialRequest) => {
    if (request.status !== 'PENDING') {
      alert('Apenas pedidos pendentes podem ser editados');
      return;
    }

    setFormData({
      category: request.category,
      itemName: request.itemName,
      quantity: request.quantity,
      unit: request.unit,
      notes: request.notes || '',
    });
    setEditingId(request.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este pedido?')) return;

    try {
      const response = await fetch(`/api/material-requests/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchMyRequests();
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      alert('Erro ao deletar pedido');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'HIGIENE',
      itemName: '',
      quantity: 1,
      unit: 'un',
      notes: '',
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Solicitar Materiais</h1>
              <p className="text-sm text-gray-500">Faça pedidos de suprimentos</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Pedido
            </Button>
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

      {/* Formulário */}
      {showForm && (
        <div className="px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Pedido' : 'Novo Pedido'}</CardTitle>
              <CardDescription>
                Preencha os dados do material que você precisa
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

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informações adicionais sobre o pedido..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Solicitar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold mb-3">Meus Pedidos</h2>

        {myRequests.length === 0 ? (
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              Você ainda não fez nenhum pedido. Clique em "Novo Pedido" para começar.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => (
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
                    <p className="text-sm text-gray-600 mb-3">{request.notes}</p>
                  )}

                  {request.rejectionReason && (
                    <Alert className="mb-3 bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Motivo da rejeição:</strong> {request.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>
                      Solicitado em {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(request)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
