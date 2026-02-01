import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Upload, Download, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  lastPrice?: number;
  supplier?: string;
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function GestaoCompras() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/procurement/items");
      if (!response.ok) throw new Error("Erro ao buscar itens");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao buscar itens");
    } finally {
      setLoading(false);
    }
  };

  const handleImportPrices = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/procurement/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao importar preços");
      alert("Preços importados com sucesso!");
      await fetchItems();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro na importação");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = (item: InventoryItem) => {
    const existingItem = cart.find((c) => c.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          price: Number(item.lastPrice) || 0,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.id !== id));
    } else {
      setCart(
        cart.map((c) => (c.id === id ? { ...c, quantity } : c))
      );
    }
  };

  const handleExportOrder = async () => {
    if (cart.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    try {
      setExporting(true);
      const response = await fetch("/api/procurement/export-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          schoolId: "default-school",
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar pedido");

      // Download arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedido-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setCart([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao exportar");
    } finally {
      setExporting(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Compras</h1>
          <p className="text-muted-foreground mt-2">Importe preços e gere pedidos automaticamente</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Importar Preços
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar Tabela de Preços</DialogTitle>
              <DialogDescription>
                Envie um arquivo CSV ou XML com os preços dos fornecedores
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {uploading ? "Enviando..." : "Clique ou arraste um arquivo"}
                  </p>
                  <p className="text-xs text-muted-foreground">CSV ou XML</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImportPrices}
                  disabled={uploading}
                  accept=".csv,.xml"
                />
              </label>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Buscar produto ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{item.supplier || "Sem fornecedor"}</span>
                        <span>•</span>
                        <span>R$ {Number(item.lastPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum produto encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({cart.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Carrinho vazio
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateQuantity(item.id, 0)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {totalValue.toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={handleExportOrder}
                      disabled={exporting}
                      className="w-full gap-2"
                    >
                      {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {exporting ? "Gerando..." : "Gerar Pedido"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
