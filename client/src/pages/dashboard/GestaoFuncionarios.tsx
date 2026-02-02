import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Search,
  X
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  unit?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN_MATRIZ: 'Admin Matriz',
  GESTOR_REDE: 'Gestor de Rede',
  DIRETOR_UNIDADE: 'Diretor de Unidade',
  COORD_PEDAGOGICO: 'Coordenador Pedagógico',
  SECRETARIA: 'Secretaria',
  NUTRICIONISTA: 'Nutricionista',
  PROFESSOR: 'Professor',
};

export default function GestaoFuncionarios() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    role: 'PROFESSOR',
    password: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save employee');
      }
      
      alert(editingId ? 'Funcionário atualizado com sucesso!' : 'Funcionário criado com sucesso!');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        role: 'PROFESSOR',
        password: '',
      });
      fetchEmployees();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      alert(error.message || 'Erro ao salvar funcionário');
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      cpf: employee.cpf || '',
      phone: employee.phone || '',
      role: employee.role,
      password: '', // Don't populate password
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este funcionário?')) return;
    
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to deactivate employee');
      
      alert('Funcionário desativado com sucesso!');
      fetchEmployees();
    } catch (error) {
      console.error('Error deactivating employee:', error);
      alert('Erro ao desativar funcionário');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ROLE_LABELS[emp.role]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando funcionários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestão de Funcionários</h1>
        <p className="text-gray-600">Gerenciar equipe e controle de acessos</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Novo Funcionário'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo do funcionário"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label>Cargo *</Label>
                  <select
                    required
                    className="w-full p-2 border rounded"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="PROFESSOR">Professor</option>
                    <option value="COORD_PEDAGOGICO">Coordenador Pedagógico</option>
                    <option value="DIRETOR_UNIDADE">Diretor de Unidade</option>
                    <option value="SECRETARIA">Secretaria</option>
                    <option value="NUTRICIONISTA">Nutricionista</option>
                    <option value="GESTOR_REDE">Gestor de Rede</option>
                    <option value="ADMIN_MATRIZ">Admin Matriz</option>
                  </select>
                </div>
                {!editingId && (
                  <div>
                    <Label>Senha *</Label>
                    <Input
                      required={!editingId}
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Senha inicial"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Atualizar' : 'Criar'} Funcionário
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      email: '',
                      cpf: '',
                      phone: '',
                      role: 'PROFESSOR',
                      password: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Equipe ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum funcionário encontrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">Nome</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Cargo</th>
                    <th className="pb-3 font-semibold">Unidade</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b last:border-0">
                      <td className="py-3">{employee.name}</td>
                      <td className="py-3 text-sm text-gray-600">{employee.email}</td>
                      <td className="py-3">
                        <Badge variant="outline">
                          {ROLE_LABELS[employee.role] || employee.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {employee.unit?.name || 'N/A'}
                      </td>
                      <td className="py-3">
                        <Badge variant={employee.isActive ? 'default' : 'destructive'}>
                          {employee.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {employee.isActive && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeactivate(employee.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
