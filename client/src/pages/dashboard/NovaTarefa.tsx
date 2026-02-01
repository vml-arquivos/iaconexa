import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ArrowLeft, Save, Send, Paperclip } from "lucide-react";
import { toast } from "sonner";

export default function NovaTarefa() {
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState("");

  const handleGenerateAI = () => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
      setIsGenerating(false);
      setDescription(`Olá alunos! 🌟\n\nPara consolidar nosso aprendizado sobre Frações, vamos realizar uma atividade prática:\n\n1. Encontre 3 objetos em sua casa que possam ser divididos em partes iguais (ex: pizza, chocolate, laranja).\n2. Tire uma foto de cada objeto dividido e escreva a fração correspondente.\n3. Explique como você usaria essas frações no dia a dia.\n\nBom trabalho! 🚀`);
      toast.success("Descrição gerada com sucesso!");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Tarefa criada e notificação enviada aos alunos!");
    setTimeout(() => setLocation("/dashboard/tarefas"), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/tarefas")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Nova Tarefa</h1>
          <p className="text-muted-foreground">Crie atividades e distribua para suas turmas.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Detalhes da Atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título da Tarefa</Label>
                <Input placeholder="Ex: Exercícios de Fixação - Frações" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Instruções</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs text-primary hover:bg-primary/10"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Gerar com IA
                  </Button>
                </div>
                <Textarea 
                  placeholder="Descreva o que os alunos devem fazer..." 
                  className="min-h-[200px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Anexos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/20 transition-colors cursor-pointer">
                  <Paperclip className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Clique para adicionar arquivos ou arraste aqui</p>
                  <p className="text-xs opacity-70 mt-1">PDF, DOCX, JPG, PNG (Max 10MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5a">5º Ano A</SelectItem>
                    <SelectItem value="5b">5º Ano B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Pontuação</Label>
                <Input type="number" placeholder="100" />
              </div>

              <div className="space-y-2">
                <Label>Tópico</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem tópico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matematica">Matemática</SelectItem>
                    <SelectItem value="portugues">Português</SelectItem>
                    <SelectItem value="ciencias">Ciências</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button className="w-full shadow-lg shadow-primary/20" onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Criar Tarefa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
