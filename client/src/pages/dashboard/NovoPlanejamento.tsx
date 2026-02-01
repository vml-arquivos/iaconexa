import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";

export default function NovoPlanejamento() {
  const [, setLocation] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiSuggestion("Com base na BNCC (EF05HI02), sugiro incluir uma atividade prática sobre a cultura indígena local para enriquecer o tópico 'Período Colonial'.");
      toast.success("Análise CONEXA AI concluída!");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Planejamento enviado para aprovação!");
    setTimeout(() => setLocation("/dashboard/planejamentos"), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/planejamentos")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Novo Planejamento</h1>
          <p className="text-muted-foreground">Crie um novo plano de aula alinhado à BNCC.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Detalhes da Aula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disciplina</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="historia">História</SelectItem>
                      <SelectItem value="matematica">Matemática</SelectItem>
                      <SelectItem value="portugues">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="space-y-2">
                <Label>Tema da Aula</Label>
                <Input placeholder="Ex: A Chegada da Família Real ao Brasil" />
              </div>

              <div className="space-y-2">
                <Label>Objetivos de Aprendizagem (BNCC)</Label>
                <Textarea 
                  placeholder="Descreva os objetivos ou códigos BNCC..." 
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Metodologia e Recursos</Label>
                <Textarea 
                  placeholder="Como a aula será conduzida..." 
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* AI Assistant Card */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                CONEXA AI AI
              </CardTitle>
              <CardDescription>
                Seu assistente pedagógico inteligente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!aiSuggestion ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Preencha os detalhes da aula e peça uma análise para receber sugestões.
                </div>
              ) : (
                <div className="bg-background/80 backdrop-blur p-4 rounded-lg border border-primary/10 text-sm animate-in fade-in slide-in-from-bottom-2">
                  <p className="font-medium text-primary mb-2">Sugestão:</p>
                  <p className="text-foreground/80 leading-relaxed">{aiSuggestion}</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full border-primary/20 hover:bg-primary/10 text-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  "Analisar Qualidade BNCC"
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button className="w-full shadow-lg shadow-primary/20" onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Enviar para Aprovação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
