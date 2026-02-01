import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Página</h1>
          <p className="text-slate-600 mt-1">Conteúdo em desenvolvimento</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      <Card className="p-8 text-center">
        <p className="text-slate-600 text-lg">Esta página está em desenvolvimento</p>
        <p className="text-slate-500 mt-2">Funcionalidade em breve</p>
      </Card>
    </div>
  );
}
