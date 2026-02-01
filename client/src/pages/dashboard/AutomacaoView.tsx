import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  Brain, 
  Database, 
  ArrowRight,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AutomacaoView() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const steps = [
    { icon: Zap, label: "Webhook Trigger", desc: "Novo planejamento recebido" },
    { icon: Database, label: "Busca Dados", desc: "Recuperando contexto do aluno" },
    { icon: Brain, label: "Análise IA", desc: "Validando critérios BNCC" },
    { icon: Mail, label: "Notificação", desc: "Email enviado ao coordenador" },
    { icon: CheckCircle2, label: "Conclusão", desc: "Processo finalizado" }
  ];

  const runSimulation = () => {
    setIsRunning(true);
    setActiveStep(0);
    setLogs(["Iniciando fluxo de automação..."]);

    const delays = [1000, 2500, 4500, 6000, 7000];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setActiveStep(index + 1);
        const newLog = `[${new Date().toLocaleTimeString()}] Passo ${index + 1}: ${steps[index].label} - Sucesso`;
        setLogs(prev => [...prev, newLog]);
        
        if (index === steps.length - 1) {
          setIsRunning(false);
          setLogs(prev => [...prev, "Fluxo concluído com sucesso!"]);
        }
      }, delay);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Monitor de Automação</h1>
        <p className="text-muted-foreground">Visualize em tempo real como o CONEXA processa as tarefas em segundo plano.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fluxo de Aprovação Inteligente</CardTitle>
              <CardDescription>Workflow n8n: Validação de Planejamento</CardDescription>
            </div>
            <Button 
              onClick={runSimulation} 
              disabled={isRunning}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Executando..." : "Simular Execução"}
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative flex justify-between items-center">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-10 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(activeStep / steps.length) * 100}%` }}
              />

              {steps.map((step, index) => {
                const isActive = index < activeStep;
                const isCurrent = index === activeStep && isRunning;

                return (
                  <div key={index} className="flex flex-col items-center gap-4 bg-background p-2 rounded-xl">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        scale: isCurrent ? 1.2 : 1,
                        borderColor: isActive || isCurrent ? "var(--primary)" : "var(--border)"
                      }}
                      className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center bg-background z-10
                        ${isActive ? "text-primary border-primary" : "text-muted-foreground border-border"}
                        ${isCurrent ? "shadow-[0_0_20px_rgba(0,82,204,0.3)]" : ""}
                      `}
                    >
                      <step.icon className="w-5 h-5" />
                    </motion.div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block max-w-[100px]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Visualization Area */}
            <div className="mt-12 p-6 bg-secondary/30 rounded-xl border border-border/50 min-h-[200px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isRunning ? (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                      {(() => {
                        const StepIcon = steps[Math.min(activeStep, steps.length - 1)].icon;
                        return <StepIcon className="w-8 h-8" />;
                      })()}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {steps[Math.min(activeStep, steps.length - 1)].label}
                    </h3>
                    <p className="text-muted-foreground">
                      {steps[Math.min(activeStep, steps.length - 1)].desc}...
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Clique em "Simular Execução" para ver o fluxo em ação.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Logs Panel */}
        <Card className="bg-black/95 text-green-400 font-mono text-xs border-border/50 shadow-sm h-full max-h-[600px] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-2">
            {logs.length === 0 ? (
              <span className="text-white/30 italic">Waiting for events...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="border-l-2 border-green-500/30 pl-2">
                  {log}
                </div>
              ))
            )}
            {isRunning && (
              <div className="animate-pulse">_</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
