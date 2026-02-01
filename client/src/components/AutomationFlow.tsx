import { motion } from "framer-motion";
import { ArrowRight, Mail, Check, Brain, FileText, Zap } from "lucide-react";

const steps = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Submissão",
    desc: "Professor envia o plano"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Automação",
    desc: "n8n captura o evento"
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Análise IA",
    desc: "CONEXA AI valida BNCC"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Notificação",
    desc: "Email com resumo"
  },
  {
    icon: <Check className="w-6 h-6" />,
    title: "Decisão",
    desc: "Aprovação em 1 clique"
  }
];

export default function AutomationFlow() {
  return (
    <section id="automation" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Automação Inteligente</span>
            <h2 className="font-display font-bold text-4xl mb-6 text-foreground">
              De 5 dias para 5 minutos.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              O fluxo de aprovação manual é o maior gargalo pedagógico. O CONEXA automatiza todo o processo: desde a submissão até a análise de qualidade pela IA e notificação ao coordenador.
            </p>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="ml-auto text-muted-foreground/30">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <img 
                src="/images/ai-analysis.jpg" 
                alt="AI Analysis Visualization" 
                className="w-full h-auto rounded-2xl shadow-lg mb-8"
              />
              
              <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Análise CONEXA AI</h4>
                      <p className="text-xs text-gray-500">Processado agora</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Score 9.8</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[98%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Aderência BNCC</span>
                    <span>98%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
