import { motion } from "framer-motion";

const stats = [
  { value: "90%", label: "Redução no tempo de aprovação", sub: "De dias para horas" },
  { value: "100%", label: "Alinhamento à BNCC", sub: "Garantia de qualidade" },
  { value: "Zero", label: "Papelada física", sub: "Gestão 100% digital" },
  { value: "24/7", label: "Disponibilidade", sub: "Acesso em qualquer lugar" }
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display font-bold text-4xl mb-6">Impacto Real na Educação</h2>
          <p className="text-xl text-primary-foreground/80">
            Mais do que software, o CONEXA entrega resultados mensuráveis que transformam a cultura escolar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <div className="font-display font-bold text-6xl mb-2 text-accent">{stat.value}</div>
              <div className="font-bold text-lg mb-1">{stat.label}</div>
              <div className="text-sm text-primary-foreground/60 uppercase tracking-wider">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
