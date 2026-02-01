import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between h-20">
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-display text-xl">A</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">CONEXA</span>
          </a>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
          <a href="#automation" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Automação</a>
          <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Benefícios</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              Acessar Sistema
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
