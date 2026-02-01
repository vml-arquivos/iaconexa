import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold font-display text-xl">A</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">CONEXA</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Sistema Integrado de Gestão Educacional que une IA, automação e design para transformar escolas.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">Twitter</Button>
              <Button variant="outline" size="sm">LinkedIn</Button>
              <Button variant="outline" size="sm">Instagram</Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Pedagógico</a></li>
              <li><a href="#" className="hover:text-primary">Administrativo</a></li>
              <li><a href="#" className="hover:text-primary">CONEXA AI AI</a></li>
              <li><a href="#" className="hover:text-primary">Preços</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Carreiras</a></li>
              <li><a href="#" className="hover:text-primary">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 CONEXA. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground">Privacidade</a>
            <a href="#" className="hover:text-foreground">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
