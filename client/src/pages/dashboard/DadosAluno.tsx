import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  User, 
  FileText, 
  ArrowLeft,
  Save,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  birthDate: string;
  cpf?: string;
  email?: string;
  enrollmentId?: string;
  healthProfile?: HealthProfile;
  observations?: Observation[];
}

interface HealthProfile {
  id: string;
  bloodType?: string;
  hasAllergy: boolean;
  allergyDetails?: string;
  dietaryRestrictions?: string;
  hasSpecialNeeds: boolean;
  medicalReport?: string;
  medications?: string;
  emergencyContact?: string;
  susNumber?: string;
}

interface Observation {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  isPrivate: boolean;
  author: {
    id: string;
    name: string;
    role: string;
  };
}

export default function DadosAluno() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthData, setHealthData] = useState<Partial<HealthProfile>>({});
  const [newObservation, setNewObservation] = useState({
    type: 'BEHAVIORAL',
    title: '',
    description: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student basic data
      const studentRes = await fetch(`/api/students/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!studentRes.ok) throw new Error('Failed to fetch student');
      const studentData = await studentRes.json();
      
      // Fetch health profile
      try {
        const healthRes = await fetch(`/api/students/${id}/health`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (healthRes.ok) {
          const healthProfile = await healthRes.json();
          studentData.healthProfile = healthProfile;
          setHealthData(healthProfile);
        }
      } catch (err) {
        console.log('No health profile found');
      }
      
      // Fetch observations
      try {
        const obsRes = await fetch(`/api/observations/student/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (obsRes.ok) {
          const observations = await obsRes.json();
          studentData.observations = observations;
        }
      } catch (err) {
        console.log('No observations found');
      }
      
      setStudent(studentData);
    } catch (error) {
      console.error('Error fetching student data:', error);
      alert('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const saveHealthProfile = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/students/${id}/health`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(healthData),
      });
      
      if (!response.ok) throw new Error('Failed to save health profile');
      
      alert('Perfil de saúde atualizado com sucesso!');
      fetchStudentData();
    } catch (error) {
      console.error('Error saving health profile:', error);
      alert('Erro ao salvar perfil de saúde');
    } finally {
      setSaving(false);
    }
  };

  const createObservation = async () => {
    try {
      if (!newObservation.title || !newObservation.description) {
        alert('Preencha título e descrição');
        return;
      }
      
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          studentId: id,
          ...newObservation,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create observation');
      
      alert('Observação registrada com sucesso!');
      setNewObservation({
        type: 'BEHAVIORAL',
        title: '',
        description: '',
        isPrivate: false,
      });
      fetchStudentData();
    } catch (error) {
      console.error('Error creating observation:', error);
      alert('Erro ao criar observação');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando dados do aluno...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>Aluno não encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasAllergy = student.healthProfile?.hasAllergy;
  const hasSpecialNeeds = student.healthProfile?.hasSpecialNeeds;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-gray-600">Matrícula: {student.enrollmentId || 'N/A'}</p>
          </div>
          
          <div className="flex gap-2">
            {hasAllergy && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-1" />
                ALERGIA
              </Badge>
            )}
            {hasSpecialNeeds && (
              <Badge variant="default" className="bg-blue-600">
                ♿ Inclusão
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* SEMÁFORO DE SAÚDE - Card Vermelho Piscante */}
      {hasAllergy && (
        <Alert variant="destructive" className="mb-6 border-2 border-red-600 animate-pulse">
          <AlertTriangle className="w-6 h-6" />
          <AlertDescription className="text-lg font-bold">
            ⚠️ ALERTA CRÍTICO: ALERGIA IDENTIFICADA
            <div className="mt-2 text-sm font-normal">
              <strong>Detalhes:</strong> {student.healthProfile?.allergyDetails || 'Consulte o perfil de saúde'}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasSpecialNeeds && (
        <Alert className="mb-6 border-2 border-blue-600 bg-blue-50">
          <Heart className="w-6 h-6 text-blue-600" />
          <AlertDescription className="text-lg font-bold text-blue-900">
            ♿ Aluno com Necessidades Especiais
            <div className="mt-2 text-sm font-normal">
              <strong>Laudo/Diagnóstico:</strong> {student.healthProfile?.medicalReport || 'Consulte o perfil de saúde'}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="w-4 h-4 mr-2" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="health">
            <Heart className="w-4 h-4 mr-2" />
            Saúde
          </TabsTrigger>
          <TabsTrigger value="observations">
            <FileText className="w-4 h-4 mr-2" />
            Evolução
          </TabsTrigger>
        </TabsList>

        {/* Personal Data Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo</Label>
                  <Input value={student.name} disabled />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input value={new Date(student.birthDate).toLocaleDateString('pt-BR')} disabled />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={student.cpf || 'Não informado'} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={student.email || 'Não informado'} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Perfil de Saúde
                <Button onClick={saveHealthProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo Sanguíneo</Label>
                  <Input 
                    value={healthData.bloodType || ''} 
                    onChange={(e) => setHealthData({...healthData, bloodType: e.target.value})}
                    placeholder="Ex: A+, O-"
                  />
                </div>
                <div>
                  <Label>Cartão SUS</Label>
                  <Input 
                    value={healthData.susNumber || ''} 
                    onChange={(e) => setHealthData({...healthData, susNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={healthData.hasAllergy || false}
                    onChange={(e) => setHealthData({...healthData, hasAllergy: e.target.checked})}
                  />
                  Possui Alergia
                </Label>
                {healthData.hasAllergy && (
                  <Textarea 
                    className="mt-2"
                    value={healthData.allergyDetails || ''} 
                    onChange={(e) => setHealthData({...healthData, allergyDetails: e.target.value})}
                    placeholder="Descreva as alergias (ex: Amendoim, Leite, Picada de Abelha)"
                    rows={3}
                  />
                )}
              </div>

              <div>
                <Label>Restrições Alimentares</Label>
                <Textarea 
                  value={healthData.dietaryRestrictions || ''} 
                  onChange={(e) => setHealthData({...healthData, dietaryRestrictions: e.target.value})}
                  placeholder="Ex: Vegano, Sem Glúten"
                  rows={2}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={healthData.hasSpecialNeeds || false}
                    onChange={(e) => setHealthData({...healthData, hasSpecialNeeds: e.target.checked})}
                  />
                  Possui Necessidades Especiais (Laudo)
                </Label>
                {healthData.hasSpecialNeeds && (
                  <Textarea 
                    className="mt-2"
                    value={healthData.medicalReport || ''} 
                    onChange={(e) => setHealthData({...healthData, medicalReport: e.target.value})}
                    placeholder="Detalhes do CID/Diagnóstico"
                    rows={4}
                  />
                )}
              </div>

              <div>
                <Label>Medicamentos Contínuos</Label>
                <Textarea 
                  value={healthData.medications || ''} 
                  onChange={(e) => setHealthData({...healthData, medications: e.target.value})}
                  placeholder="Ex: Insulina, Ritalina"
                  rows={2}
                />
              </div>

              <div>
                <Label>Contato de Emergência</Label>
                <Input 
                  value={healthData.emergencyContact || ''} 
                  onChange={(e) => setHealthData({...healthData, emergencyContact: e.target.value})}
                  placeholder="Nome e Telefone (Pai/Mãe)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observations Tab (Psicóloga) */}
        <TabsContent value="observations">
          <div className="space-y-6">
            {/* New Observation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Nova Observação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newObservation.type}
                      onChange={(e) => setNewObservation({...newObservation, type: e.target.value})}
                    >
                      <option value="BEHAVIORAL">Comportamental</option>
                      <option value="LEARNING">Pedagógico</option>
                      <option value="PHYSICAL">Motor/Físico</option>
                      <option value="SOCIAL">Interação Social</option>
                    </select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={newObservation.isPrivate}
                        onChange={(e) => setNewObservation({...newObservation, isPrivate: e.target.checked})}
                      />
                      {newObservation.isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      Sigiloso (Apenas Psicóloga/Direção)
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label>Título</Label>
                  <Input 
                    value={newObservation.title}
                    onChange={(e) => setNewObservation({...newObservation, title: e.target.value})}
                    placeholder="Resumo da observação"
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={newObservation.description}
                    onChange={(e) => setNewObservation({...newObservation, description: e.target.value})}
                    placeholder="Descreva a observação em detalhes..."
                    rows={4}
                  />
                </div>
                
                <Button onClick={createObservation} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Observação
                </Button>
              </CardContent>
            </Card>

            {/* Observations History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Evolução</CardTitle>
              </CardHeader>
              <CardContent>
                {student.observations && student.observations.length > 0 ? (
                  <div className="space-y-4">
                    {student.observations.map((obs) => (
                      <div key={obs.id} className="border-l-4 border-blue-600 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{obs.type}</Badge>
                            {obs.isPrivate && (
                              <Badge variant="destructive" className="text-xs">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Sigiloso
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(obs.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="font-bold">{obs.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{obs.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Por: {obs.author.name} ({obs.author.role})
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma observação registrada ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
