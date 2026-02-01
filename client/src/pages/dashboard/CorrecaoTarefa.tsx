import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const mockSubmissions = [
  { id: 1, student: "Ana Clara", avatar: "AC", file: "redacao_ferias.pdf", status: "submitted", grade: null, feedback: "" },
  { id: 2, student: "Bruno Santos", avatar: "BS", file: "minhas_ferias.docx", status: "graded", grade: 95, feedback: "Excelente trabalho, Bruno! Ótimo uso de adjetivos." },
  { id: 3, student: "Carla Dias", avatar: "CD", file: "ferias_carla.pdf", status: "submitted", grade: null, feedback: "" },
];

export default function CorrecaoTarefa() {
  const [, setLocation] = useLocation();
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentStudent = mockSubmissions[currentStudentIndex];

  const handleNext = () => {
    if (currentStudentIndex < mockSubmissions.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
      setGrade("");
      setFeedback("");
    }
  };

  const handlePrev = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
      setGrade("");
      setFeedback("");
    }
  };

  const handleSave = () => {
    toast.success(`Nota salva para ${currentStudent.student}!`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/tarefas")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Redação: Minhas Férias</h1>
            <p className="text-muted-foreground text-sm">5º Ano A • Entrega: 15/12/2025</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentStudentIndex === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-24 text-center">
            {currentStudentIndex + 1} de {mockSubmissions.length}
          </span>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={currentStudentIndex === mockSubmissions.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
        {/* Document Viewer Area */}
        <div className="lg:col-span-2 bg-secondary/30 rounded-xl border border-border/50 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
          
          <div className="w-24 h-24 bg-background rounded-xl shadow-sm flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-medium">{currentStudent.file}</h3>
          <p className="text-muted-foreground text-sm mb-6">Visualização indisponível no modo demo</p>
          <Button variant="outline">Abrir em nova aba</Button>
        </div>

        {/* Grading Panel */}
        <Card className="border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{currentStudent.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{currentStudent.student}</CardTitle>
                <Badge variant={currentStudent.status === 'graded' ? 'default' : 'secondary'} className="mt-1">
                  {currentStudent.status === 'graded' ? 'Corrigido' : 'Pendente'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <Label>Nota (0-100)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="-" 
                  className="text-lg font-bold w-24"
                  value={currentStudent.grade || grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
                <span className="text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comentários Privados
              </Label>
              <Textarea 
                placeholder="Escreva um feedback para o aluno..." 
                className="min-h-[150px] resize-none"
                value={currentStudent.feedback || feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button className="w-full gap-2" onClick={handleSave}>
                <CheckCircle2 className="w-4 h-4" />
                Devolver Atividade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
