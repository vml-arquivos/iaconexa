import { motion } from "framer-motion";
import { BookOpen, Building2, BrainCircuit, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Módulo Pedagógico",
    description: "Criação de planejamentos com templates BNCC, diário de classe digital e gestão de tarefas simplificada estilo Google Classroom.",
    items: ["1.200+ Templates Prontos", "Submissão Inteligente", "Diário Digital"]
  },
  {
    icon: <Building2 className="w-8 h-8 text-primary" />,
    title: "Módulo Administrativo",
    description: "Gestão completa de múltiplas escolas, matrículas, financeiro e documentos em uma única plataforma centralizada.",
    items: ["Multi-escola", "Gestão Financeira", "Documentos Digitais"]
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "Inteligência Artificial",
    description: "O CONEXA AI analisa planejamentos em tempo real, garantindo alinhamento à BNCC e qualidade pedagógica antes da revisão humana.",
    items: ["Análise BNCC", "Score de Qualidade", "Sugestões Automáticas"]
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-4xl mb-4 text-foreground">Tudo o que sua escola precisa em um só lugar</h2>
          <p className="text-lg text-muted-foreground">
            Uma suíte completa de ferramentas integradas para transformar a gestão escolar e pedagógica.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card hover:bg-card/80 transition-colors p-8 rounded-2xl border border-border shadow-sm hover:shadow-md group"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-display font-bold text-2xl mb-4 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
