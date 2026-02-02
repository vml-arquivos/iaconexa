// ========================================
// SISTEMA CONEXA v1.0
// Diário de Classe - Mobile Focused
// Interface rápida para professores registrarem status dos alunos
// ========================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Moon, Sun, Utensils, Droplet, Smile, Frown, AlertCircle, Check, X } from 'lucide-react';

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
  id?: string;
  studentId: string;
  classId: string;
  sleepStatus: 'SLEEPING' | 'AWAKE' | 'NAP_TIME' | null;
  foodIntake: 'FULL_MEAL' | 'PARTIAL' | 'REJECTED' | 'NA' | null;
  hygieneStatus: 'CLEAN' | 'DIAPER_CHANGE' | 'BATH' | 'SOILED' | null;
  mood: 'HAPPY' | 'CRYING' | 'AGITATED' | 'CALM' | null;
  observations: string;
  alertTriggered: boolean;
}

export default function DiarioClasse() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [logs, setLogs] = useState<Map<string, DailyLog>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
      fetchTodayLogs(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      const uniqueClasses = Array.from(
        new Map(data.map((s: any) => [s.class?.id, s.class])).values()
      ).filter(Boolean) as Class[];
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
      setLoading(true);
      const response = await fetch(`/api/students?classId=${classId}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLogs = async (classId: string) => {
    try {
      const response = await fetch(`/api/daily-log/class/${classId}/today`);
      const result = await response.json();
      if (result.success) {
        const logsMap = new Map<string, DailyLog>();
        result.data.forEach((log: any) => {
          logsMap.set(log.studentId, {
            id: log.id,
            studentId: log.studentId,
            classId: log.classId,
            sleepStatus: log.sleepStatus,
            foodIntake: log.foodIntake,
            hygieneStatus: log.hygieneStatus,
            mood: log.mood,
            observations: log.observations || '',
            alertTriggered: log.alertTriggered,
          });
        });
        setLogs(logsMap);
      }
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
    }
  };

  const getOrCreateLog = (studentId: string): DailyLog => {
    if (logs.has(studentId)) {
      return logs.get(studentId)!;
    }
    return {
      studentId,
      classId: selectedClass,
      sleepStatus: null,
      foodIntake: null,
      hygieneStatus: null,
      mood: null,
      observations: '',
      alertTriggered: false,
    };
  };

  const updateLog = (studentId: string, updates: Partial<DailyLog>) => {
    const currentLog = getOrCreateLog(studentId);
    const updatedLog = { ...currentLog, ...updates };
    setLogs(new Map(logs.set(studentId, updatedLog)));
  };

  const toggleStatus = (studentId: string, field: keyof DailyLog, value: any) => {
    const currentLog = getOrCreateLog(studentId);
    const newValue = currentLog[field] === value ? null : value;
    updateLog(studentId, { [field]: newValue });
  };

  const saveLog = async (studentId: string) => {
    const log = logs.get(studentId);
    if (!log) return;

    setSaving(true);
    try {
      const endpoint = log.id ? `/api/daily-log/${log.id}` : '/api/daily-log';
      const method = log.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });

      const result = await response.json();

      if (result.success) {
        updateLog(studentId, { id: result.data.id });
        alert('Registro salvo com sucesso!');
      } else {
        alert('Erro ao salvar: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  };

  const saveAllLogs = async () => {
    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [studentId, log] of logs.entries()) {
      // Só salvar logs que tenham pelo menos um campo preenchido
      if (!log.sleepStatus && !log.foodIntake && !log.hygieneStatus && !log.mood && !log.observations) {
        continue;
      }

      try {
        const endpoint = log.id ? `/api/daily-log/${log.id}` : '/api/daily-log';
        const method = log.id ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log),
        });

        const result = await response.json();

        if (result.success) {
          updateLog(studentId, { id: result.data.id });
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setSaving(false);
    alert(`Salvamento concluído!\n✅ Sucesso: ${successCount}\n❌ Erros: ${errorCount}`);
  };

  const getStatusColor = (field: keyof DailyLog, value: any, currentValue: any) => {
    const isActive = currentValue === value;
    
    if (field === 'sleepStatus') {
      if (value === 'SLEEPING') return isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700';
      if (value === 'AWAKE') return isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700';
      if (value === 'NAP_TIME') return isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700';
    }
    
    if (field === 'foodIntake') {
      if (value === 'FULL_MEAL') return isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700';
      if (value === 'PARTIAL') return isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700';
      if (value === 'REJECTED') return isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700';
    }
    
    if (field === 'hygieneStatus') {
      if (value === 'CLEAN') return isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700';
      if (value === 'DIAPER_CHANGE') return isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700';
      if (value === 'SOILED') return isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700';
    }
    
    if (field === 'mood') {
      if (value === 'HAPPY') return isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700';
      if (value === 'CALM') return isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700';
      if (value === 'AGITATED') return isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700';
      if (value === 'CRYING') return isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700';
    }
    
    return isActive ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Fixo */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Diário de Classe</h1>
              <p className="text-sm text-gray-500">Registro rápido por turma</p>
            </div>
            <Button 
              onClick={saveAllLogs} 
              disabled={saving || logs.size === 0}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
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

      {/* Lista de Alunos com Accordion */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando alunos...</div>
        ) : students.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum aluno encontrado nesta turma.
            </AlertDescription>
          </Alert>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {students.map((student) => {
              const log = getOrCreateLog(student.id);
              const hasAlert = log.foodIntake === 'REJECTED' || log.mood === 'CRYING';

              return (
                <AccordionItem key={student.id} value={student.id} className="border rounded-lg bg-white">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.enrollmentId}</p>
                      </div>
                      {hasAlert && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Alerta
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2">
                      {/* Sono */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Sono
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('sleepStatus', 'SLEEPING', log.sleepStatus)}
                            onClick={() => toggleStatus(student.id, 'sleepStatus', 'SLEEPING')}
                          >
                            <Moon className="h-4 w-4 mr-1" />
                            Dormindo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('sleepStatus', 'AWAKE', log.sleepStatus)}
                            onClick={() => toggleStatus(student.id, 'sleepStatus', 'AWAKE')}
                          >
                            <Sun className="h-4 w-4 mr-1" />
                            Acordado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('sleepStatus', 'NAP_TIME', log.sleepStatus)}
                            onClick={() => toggleStatus(student.id, 'sleepStatus', 'NAP_TIME')}
                          >
                            <Moon className="h-4 w-4 mr-1" />
                            Soneca
                          </Button>
                        </div>
                      </div>

                      {/* Alimentação */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          Alimentação
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('foodIntake', 'FULL_MEAL', log.foodIntake)}
                            onClick={() => toggleStatus(student.id, 'foodIntake', 'FULL_MEAL')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Completa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('foodIntake', 'PARTIAL', log.foodIntake)}
                            onClick={() => toggleStatus(student.id, 'foodIntake', 'PARTIAL')}
                          >
                            Parcial
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('foodIntake', 'REJECTED', log.foodIntake)}
                            onClick={() => toggleStatus(student.id, 'foodIntake', 'REJECTED')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Recusou
                          </Button>
                        </div>
                      </div>

                      {/* Higiene */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Droplet className="h-4 w-4" />
                          Higiene
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('hygieneStatus', 'CLEAN', log.hygieneStatus)}
                            onClick={() => toggleStatus(student.id, 'hygieneStatus', 'CLEAN')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Limpo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('hygieneStatus', 'DIAPER_CHANGE', log.hygieneStatus)}
                            onClick={() => toggleStatus(student.id, 'hygieneStatus', 'DIAPER_CHANGE')}
                          >
                            <Droplet className="h-4 w-4 mr-1" />
                            Troca Fralda
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('hygieneStatus', 'SOILED', log.hygieneStatus)}
                            onClick={() => toggleStatus(student.id, 'hygieneStatus', 'SOILED')}
                          >
                            Sujo
                          </Button>
                        </div>
                      </div>

                      {/* Humor */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Smile className="h-4 w-4" />
                          Humor
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('mood', 'HAPPY', log.mood)}
                            onClick={() => toggleStatus(student.id, 'mood', 'HAPPY')}
                          >
                            <Smile className="h-4 w-4 mr-1" />
                            Feliz
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('mood', 'CALM', log.mood)}
                            onClick={() => toggleStatus(student.id, 'mood', 'CALM')}
                          >
                            Calmo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('mood', 'AGITATED', log.mood)}
                            onClick={() => toggleStatus(student.id, 'mood', 'AGITATED')}
                          >
                            Agitado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={getStatusColor('mood', 'CRYING', log.mood)}
                            onClick={() => toggleStatus(student.id, 'mood', 'CRYING')}
                          >
                            <Frown className="h-4 w-4 mr-1" />
                            Chorando
                          </Button>
                        </div>
                      </div>

                      {/* Observações */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Observações</p>
                        <Textarea
                          value={log.observations}
                          onChange={(e) => updateLog(student.id, { observations: e.target.value })}
                          placeholder="Observações sobre o dia..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>

                      {/* Botão Salvar Individual */}
                      <Button
                        onClick={() => saveLog(student.id)}
                        disabled={saving}
                        className="w-full"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Salvar Registro
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}
