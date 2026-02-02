// ========================================
// SISTEMA CONEXA v1.0
// Agenda de Atendimentos - Mobile First
// ========================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, FileText, Plus, Save, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  name: string;
  enrollmentId: string;
}

interface Appointment {
  id: string;
  unitId: string;
  studentId: string | null;
  title: string;
  scheduledAt: string;
  type: 'PARENT_MEETING' | 'INTERNAL_COORD' | 'HEALTH_CHECK';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
  meetingMinutes: string | null;
  attendees: string | null;
  unit: Unit;
  student: Student | null;
  createdAt: string;
  updatedAt: string;
}

const appointmentTypeLabels = {
  PARENT_MEETING: 'Reunião com Pais',
  INTERNAL_COORD: 'Coordenação Interna',
  HEALTH_CHECK: 'Avaliação de Saúde',
};

const appointmentTypeColors = {
  PARENT_MEETING: 'bg-blue-100 text-blue-800',
  INTERNAL_COORD: 'bg-purple-100 text-purple-800',
  HEALTH_CHECK: 'bg-green-100 text-green-800',
};

const statusLabels = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

const statusColors = {
  SCHEDULED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
};

export default function AgendaAtendimentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: '',
    type: 'PARENT_MEETING',
    studentId: '',
    attendees: '',
  });

  useEffect(() => {
    fetchUnits();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchUpcomingAppointments(selectedUnit);
    }
  }, [selectedUnit]);

  const fetchUnits = async () => {
    try {
      // Buscar unidades (assumindo endpoint existente)
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

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const fetchUpcomingAppointments = async (unitId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments/unit/${unitId}/upcoming?limit=20`);
      const result = await response.json();
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unitId: selectedUnit,
          studentId: formData.studentId || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        resetForm();
        fetchUpcomingAppointments(selectedUnit);
      } else {
        alert('Erro ao criar agendamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao criar agendamento');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string, meetingMinutes: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingMinutes }),
      });

      const result = await response.json();

      if (result.success) {
        setSelectedAppointment(null);
        fetchUpcomingAppointments(selectedUnit);
      } else {
        alert('Erro ao concluir agendamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao concluir:', error);
      alert('Erro ao concluir agendamento');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (result.success) {
        fetchUpcomingAppointments(selectedUnit);
      } else {
        alert('Erro ao cancelar agendamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      alert('Erro ao cancelar agendamento');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      scheduledAt: '',
      type: 'PARENT_MEETING',
      studentId: '',
      attendees: '',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Mobile */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Agenda de Atendimentos</h1>
              <p className="text-sm text-gray-500">Próximos agendamentos</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do atendimento
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Reunião de Pais - Turma A"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(appointmentTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Data e Hora *</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student">Aluno (Opcional)</Label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendees">Participantes</Label>
                    <Input
                      id="attendees"
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                      placeholder="Ex: Coordenador, Professor, Pais"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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

      {/* Lista de Agendamentos */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : appointments.length === 0 ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Nenhum agendamento encontrado. Clique em "Novo" para criar.
            </AlertDescription>
          </Alert>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{appointment.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {appointment.student && (
                        <span className="block">{appointment.student.name}</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[appointment.status]} variant="secondary">
                    {statusLabels[appointment.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Info Grid */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatDate(appointment.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatTime(appointment.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <Badge className={appointmentTypeColors[appointment.type]} variant="secondary">
                      {appointmentTypeLabels[appointment.type]}
                    </Badge>
                  </div>
                  {appointment.attendees && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{appointment.attendees}</span>
                    </div>
                  )}
                </div>

                {/* Ata da Reunião */}
                {appointment.meetingMinutes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Ata da Reunião:</p>
                    <p className="text-sm text-gray-600">{appointment.meetingMinutes}</p>
                  </div>
                )}

                {/* Ações */}
                {appointment.status === 'SCHEDULED' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para Concluir Agendamento */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Concluir Atendimento</DialogTitle>
              <DialogDescription>{selectedAppointment.title}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const minutes = formData.get('minutes') as string;
                handleComplete(selectedAppointment.id, minutes);
              }}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="minutes">Ata da Reunião</Label>
                <Textarea
                  id="minutes"
                  name="minutes"
                  placeholder="Descreva o que foi discutido e as decisões tomadas..."
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
