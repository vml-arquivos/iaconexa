import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              Revolução na Gestão Pedagógica
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.1] tracking-tight text-foreground mb-6">
              Devolva tempo de qualidade aos <span className="text-primary">educadores</span>.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Um ecossistema inteligente que conecta gestores, coordenadores e professores com IA e automação para transformar a educação.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-primary/20 hover:bg-primary/5">
              Ver Demonstração
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-8 flex items-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>IA Integrada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Automação n8n</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Gestão Centralizada</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/50 backdrop-blur-sm">
            <img 
              src="/images/hero-bg.jpg" 
              alt="CONEXA Dashboard Interface" 
              className="w-full h-auto object-cover"
            />
            
            {/* Floating Glass Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40 max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                <span className="text-sm font-bold text-gray-800">Aprovado</span>
              </div>
              <p className="text-xs text-gray-600">Planejamento 4º Ano validado pela IA em 3s.</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-10 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">98%</div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Aderência BNCC</p>
                  <p className="text-sm font-bold text-gray-800">Excelente</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
