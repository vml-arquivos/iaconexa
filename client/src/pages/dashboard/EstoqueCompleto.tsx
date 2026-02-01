import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, AlertTriangle, Loader2 } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unit: string;
}

const CATEGORIAS = ["HIGIENE", "PEDAGOGICO", "ALIMENTACAO"];
const CATEGORIA_LABELS: Record<string, string> = {
  HIGIENE: "Higiene",
  PEDAGOGICO: "Pedagógico",
  ALIMENTACAO: "Alimentação",
};

export default function EstoqueCompleto() {
  const [estoque, setEstoque] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reposting, setReposting] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/inventory");
        if (!response.ok) throw new Error("Erro ao buscar estoque");
        const data = await response.json();
        setEstoque(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setEstoque([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleReporEstoque = async (id: string) => {
    try {
      setReposting(id);
      const item = estoque.find(i => i.id === id);
      if (!item) return;

      const response = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          quantity: item.minThreshold * 2,
        }),
      });

      if (!response.ok) throw new Error("Erro ao repor estoque");
      const updatedItem = await response.json();
      
      setEstoque(estoque.map(i => i.id === id ? updatedItem : i));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao repor estoque");
    } finally {
      setReposting(null);
    }
  };

  const renderTabContent = (categoria: string) => {
    const itensCategoria = estoque.filter(item => item.category === categoria);

    return (
      <div className="space-y-4">
        {itensCategoria.map((item) => {
          const precisaRepor = item.quantity < item.minThreshold;

          return (
            <Card key={item.id} className={precisaRepor ? "border-red-200 bg-red-50/30 dark:bg-red-950/20" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      {precisaRepor && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Quantidade</p>
                        <p className="font-semibold text-lg">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Mínimo</p>
                        <p className="font-semibold text-lg">
                          {item.minThreshold} {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {precisaRepor ? (
                    <Button
                      onClick={() => handleReporEstoque(item.id)}
                      disabled={reposting === item.id}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2 h-auto py-3"
                    >
                      {reposting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="text-xs font-semibold">
                        {reposting === item.id ? "Repoindo..." : "Repor Estoque"}
                      </span>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      OK
                    </Button>
                  )}
                </div>

                {precisaRepor && (
                  <div className="mt-3 bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded p-2">
                    <p className="text-xs text-red-700 dark:text-red-200">
                      Quantidade abaixo do mínimo. Reposição necessária!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {itensCategoria.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhum item nesta categoria</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const itensComProblema = estoque.filter(item => item.quantity < item.minThreshold).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque Completo</h1>
          <p className="text-muted-foreground mt-2">Gerencie o inventário da instituição</p>
        </div>
        {itensComProblema > 0 && (
          <Badge variant="destructive" className="gap-2 px-3 py-1.5">
            <AlertTriangle className="h-4 w-4" />
            {itensComProblema} item(ns) crítico(s)
          </Badge>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <p className="text-red-700">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="HIGIENE" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {CATEGORIAS.map((categoria) => (
            <TabsTrigger key={categoria} value={categoria}>
              {CATEGORIA_LABELS[categoria]}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIAS.map((categoria) => (
          <TabsContent key={categoria} value={categoria} className="space-y-4">
            {renderTabContent(categoria)}
          </TabsContent>
        ))}
      </Tabs>

      {estoque.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhum item de estoque cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
