// ========================================
// SISTEMA CONEXA v1.0
// Diário Digital - Mobile First
// ========================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Baby, Moon, Utensils, Droplet, Smile, AlertCircle, Plus, Calendar, Save, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  enrollmentId: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

interface DailyLog {
  id: string;
  date: string;
  studentId: string;
  classId: string;
  sleepStatus: 'SLEEPING' | 'AWAKE' | 'NAP_TIME' | null;
  foodIntake: 'FULL_MEAL' | 'PARTIAL' | 'REJECTED' | 'NA' | null;
  hygieneStatus: 'CLEAN' | 'DIAPER_CHANGE' | 'BATH' | 'SOILED' | null;
  mood: 'HAPPY' | 'CRYING' | 'AGITATED' | 'CALM' | null;
  observations: string | null;
  alertTriggered: boolean;
  student: Student;
  class: Class;
  createdAt: string;
  updatedAt: string;
}

const sleepStatusLabels = {
  SLEEPING: 'Dormindo',
  AWAKE: 'Acordado',
  NAP_TIME: 'Soneca',
};

const foodIntakeLabels = {
  FULL_MEAL: 'Refeição Completa',
  PARTIAL: 'Parcial',
  REJECTED: 'Recusou',
  NA: 'Não Aplicável',
};

const hygieneStatusLabels = {
  CLEAN: 'Limpo',
  DIAPER_CHANGE: 'Troca de Fralda',
  BATH: 'Banho',
  SOILED: 'Sujo',
};

const moodLabels = {
  HAPPY: 'Feliz',
  CRYING: 'Chorando',
  AGITATED: 'Agitado',
  CALM: 'Calmo',
};

export default function DiarioDigital() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    sleepStatus: '',
    foodIntake: '',
    hygieneStatus: '',
    mood: '',
    observations: '',
    alertTriggered: false,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTodayLogs(selectedClass);
      fetchStudentsByClass(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      const uniqueClasses = Array.from(
        new Map(data.map((s: any) => [s.class
.id, s.class])).values()
      ) as Class[];
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    }
  };

  const fetchStudentsByClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/students?classId=${classId}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const fetchTodayLogs = async (classId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/daily-log/class/${classId}/today`);
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          classId: selectedClass,
          sleepStatus: formData.sleepStatus || null,
          foodIntake: formData.foodIntake || null,
          hygieneStatus: formData.hygieneStatus || null,
          mood: formData.mood || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        resetForm();
        fetchTodayLogs(selectedClass);
      } else {
        alert('Erro ao salvar registro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      classId: '',
      sleepStatus: '',
      foodIntake: '',
      hygieneStatus: '',
      mood: '',
      observations: '',
      alertTriggered: false,
    });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return <Smile className="h-5 w-5 text-gray-400" />;
    switch (mood) {
      case 'HAPPY':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'CRYING':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'AGITATED':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'CALM':
        return <Smile className="h-5 w-5 text-blue-500" />;
      default:
        return <Smile className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Mobile */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Diário Digital</h1>
              <p className="text-sm text-gray-500">Registros do dia</p>
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
                  <DialogTitle>Novo Registro</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do aluno
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Aluno *</Label>
                    <Select
                      value={formData.studentId}
                      onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aluno" />
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
                    <Label htmlFor="sleep">Sono</Label>
                    <Select
                      value={formData.sleepStatus}
                      onValueChange={(value) => setFormData({ ...formData, sleepStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sleepStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="food">Alimentação</Label>
                    <Select
                      value={formData.foodIntake}
                      onValueChange={(value) => setFormData({ ...formData, foodIntake: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(foodIntakeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hygiene">Higiene</Label>
                    <Select
                      value={formData.hygieneStatus}
                      onValueChange={(value) => setFormData({ ...formData, hygieneStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(hygieneStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mood">Humor</Label>
                    <Select
                      value={formData.mood}
                      onValueChange={(value) => setFormData({ ...formData, mood: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o humor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(moodLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={4}
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

          {/* Seletor de Turma */}
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.level && `- ${cls.level}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : logs.length === 0 ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Nenhum registro encontrado para hoje. Clique em "Novo" para adicionar.
            </AlertDescription>
          </Alert>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{log.student.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {log.student.enrollmentId}
                    </CardDescription>
                  </div>
                  {getMoodIcon(log.mood)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {log.sleepStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span className="text-gray-600">
                        {sleepStatusLabels[log.sleepStatus]}
                      </span>
                    </div>
                  )}
                  {log.foodIntake && (
                    <div className="flex items-center gap-2 text-sm">
                      <Utensils className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">
                        {foodIntakeLabels[log.foodIntake]}
                      </span>
                    </div>
                  )}
                  {log.hygieneStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">
                        {hygieneStatusLabels[log.hygieneStatus]}
                      </span>
                    </div>
                  )}
                  {log.mood && (
                    <div className="flex items-center gap-2 text-sm">
                      <Baby className="h-4 w-4 text-pink-500" />
                      <span className="text-gray-600">{moodLabels[log.mood]}</span>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {log.observations && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 italic">{log.observations}</p>
                  </div>
                )}

                {/* Alerta */}
                {log.alertTriggered && (
                  <Badge variant="destructive" className="w-full justify-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Alerta Ativado
                  </Badge>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-400 text-right">
                  {new Date(log.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
