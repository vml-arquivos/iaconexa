import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock,
  FileText,
  User,
  MessageSquare,
  Send,
  Tv,
  History,
  Search,
  Filter
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  type: string;
  isClosed: boolean;
  minutes?: string;
  host: {
    id: string;
    name: string;
    role: string;
  };
  unit?: {
    id: string;
    name: string;
  };
  topics: Topic[];
  actions: ActionItem[];
  attendees: User[];
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  status: string;
  suggester: {
    id: string;
    name: string;
    role: string;
  };
}

interface ActionItem {
  id: string;
  description: string;
  dueDate?: string;
  isCompleted: boolean;
  assignee: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Coordenacao() {
  const [upcomingMeeting, setUpcomingMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [minutes, setMinutes] = useState('');
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());
  const [newActionItems, setNewActionItems] = useState<Array<{assigneeId: string, description: string}>>([]);
  const [historyMeetings, setHistoryMeetings] = useState<Meeting[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchUpcomingMeeting();
  }, []);

  const fetchUpcomingMeeting = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meetings/upcoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch upcoming meeting');
      
      const data = await response.json();
      setUpcomingMeeting(data);
    } catch (error) {
      console.error('Error fetching upcoming meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestTopic = async () => {
    if (!upcomingMeeting || !newTopicTitle) {
      alert('Preencha o título da pauta');
      return;
    }
    
    try {
      const response = await fetch('/api/meetings/topics/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          meetingId: upcomingMeeting.id,
          title: newTopicTitle,
          description: newTopicDescription,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to suggest topic');
      
      alert('Pauta sugerida com sucesso!');
      setNewTopicTitle('');
      setNewTopicDescription('');
      fetchUpcomingMeeting();
    } catch (error) {
      console.error('Error suggesting topic:', error);
      alert('Erro ao sugerir pauta');
    }
  };

  const startMeeting = async () => {
    if (!upcomingMeeting) return;
    
    const approvedTopicIds = upcomingMeeting.topics
      .filter(t => t.status === 'SUGGESTED')
      .map(t => t.id);
    
    try {
      const response = await fetch('/api/meetings/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          meetingId: upcomingMeeting.id,
          approvedTopicIds,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to start meeting');
      
      setLiveMode(true);
      fetchUpcomingMeeting();
    } catch (error) {
      console.error('Error starting meeting:', error);
      alert('Erro ao iniciar reunião');
    }
  };

  const finalizeMeeting = async () => {
    if (!upcomingMeeting) return;
    
    const discussedTopicIds = Array.from(checkedTopics);
    const deferredTopicIds = upcomingMeeting.topics
      .filter(t => !checkedTopics.has(t.id))
      .map(t => t.id);
    
    try {
      const response = await fetch('/api/meetings/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          meetingId: upcomingMeeting.id,
          minutes,
          actionItems: newActionItems,
          discussedTopicIds,
          deferredTopicIds,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to finalize meeting');
      
      alert('Reunião finalizada com sucesso!');
      setLiveMode(false);
      setCheckedTopics(new Set());
      setMinutes('');
      setNewActionItems([]);
      fetchUpcomingMeeting();
    } catch (error) {
      console.error('Error finalizing meeting:', error);
      alert('Erro ao finalizar reunião');
    }
  };

  const toggleTopicCheck = (topicId: string) => {
    const newChecked = new Set(checkedTopics);
    if (newChecked.has(topicId)) {
      newChecked.delete(topicId);
    } else {
      newChecked.add(topicId);
    }
    setCheckedTopics(newChecked);
  };

  const addActionItem = () => {
    setNewActionItems([...newActionItems, { assigneeId: '', description: '' }]);
  };

  const updateActionItem = (index: number, field: string, value: string) => {
    const updated = [...newActionItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewActionItems(updated);
  };

  const searchHistory = async () => {
    try {
      const response = await fetch(`/api/meetings/general?keyword=${searchKeyword}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to search meetings');
      
      const data = await response.json();
      setHistoryMeetings(data);
    } catch (error) {
      console.error('Error searching meetings:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando coordenação...</p>
        </div>
      </div>
    );
  }

  // Live Mode - Tela para projetar na TV
  if (liveMode && upcomingMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{upcomingMeeting.title}</h1>
              <p className="text-xl text-gray-600 mt-2">
                Mediador: {upcomingMeeting.host.name}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLiveMode(false)}
              className="gap-2"
            >
              <Tv className="w-5 h-5" />
              Sair do Modo Live
            </Button>
          </div>

          {/* Topics Checklist */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Pauta da Reunião</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeeting.topics.map((topic) => (
                  <div 
                    key={topic.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      checkedTopics.has(topic.id) 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}
                    onClick={() => toggleTopicCheck(topic.id)}
                  >
                    <div className="flex items-start gap-3">
                      {checkedTopics.has(topic.id) ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{topic.title}</h3>
                        {topic.description && (
                          <p className="text-gray-600 mt-1">{topic.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Sugerido por: {topic.suggester.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Notes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Anotações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Registre as decisões e discussões aqui..."
                rows={6}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-between">
                Tarefas Geradas
                <Button onClick={addActionItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {newActionItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="Responsável (ID)"
                      value={item.assigneeId}
                      onChange={(e) => updateActionItem(index, 'assigneeId', e.target.value)}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="Descrição da tarefa"
                      value={item.description}
                      onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Finalize Button */}
          <Button 
            onClick={finalizeMeeting} 
            className="w-full h-16 text-xl"
            variant="default"
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Finalizar Reunião e Salvar Ata
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Coordenação Pedagógica</h1>
        <p className="text-gray-600">Gestão colaborativa de reuniões HTPC</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            <Calendar className="w-4 h-4 mr-2" />
            Próxima Coordenação
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Histórico & Atas
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Meeting Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          {!upcomingMeeting ? (
            <Alert>
              <AlertDescription>
                Nenhuma reunião agendada. Entre em contato com a coordenação.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Mediador da Semana */}
              <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-600" />
                    Mediador da Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {upcomingMeeting.host.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{upcomingMeeting.host.name}</h2>
                      <p className="text-gray-600">{upcomingMeeting.host.role}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(upcomingMeeting.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pauta Colaborativa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Pauta Colaborativa
                    </span>
                    <Badge variant="outline">
                      {upcomingMeeting.topics.length} tópicos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Suggest New Topic Form */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                    <Label className="text-lg font-semibold">+ Sugerir Nova Pauta</Label>
                    <Input
                      placeholder="Título da pauta"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Descrição (opcional)"
                      value={newTopicDescription}
                      onChange={(e) => setNewTopicDescription(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={suggestTopic} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Sugestão
                    </Button>
                  </div>

                  {/* Topics List */}
                  {upcomingMeeting.topics.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma pauta sugerida ainda. Seja o primeiro!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMeeting.topics.map((topic) => (
                        <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{topic.title}</h4>
                              {topic.description && (
                                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Por: {topic.suggester.name} ({topic.suggester.role})
                              </p>
                            </div>
                            <Badge 
                              variant={
                                topic.status === 'APPROVED' ? 'default' :
                                topic.status === 'DISCUSSED' ? 'default' :
                                topic.status === 'DEFERRED' ? 'destructive' :
                                'outline'
                              }
                            >
                              {topic.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Start Meeting Button */}
              {!upcomingMeeting.isClosed && (
                <Button 
                  onClick={startMeeting} 
                  className="w-full h-14 text-lg"
                  variant="default"
                >
                  <Tv className="w-5 h-5 mr-2" />
                  Iniciar Reunião (Modo Live)
                </Button>
              )}
            </>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Atas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por palavra-chave (ex: Inclusão, Festa Junina)"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchHistory()}
                />
                <Button onClick={searchHistory}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {historyMeetings.length > 0 && (
            <div className="space-y-4">
              {historyMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{meeting.title}</span>
                      <Badge>{meeting.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(meeting.date).toLocaleDateString('pt-BR')} - 
                      Mediador: {meeting.host.name}
                    </p>
                    {meeting.minutes && (
                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h4 className="font-semibold mb-2">Ata:</h4>
                        <p className="text-sm whitespace-pre-wrap">{meeting.minutes}</p>
                      </div>
                    )}
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Tópicos Discutidos:</h4>
                      <div className="space-y-1">
                        {meeting.topics.map((topic) => (
                          <div key={topic.id} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {topic.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
