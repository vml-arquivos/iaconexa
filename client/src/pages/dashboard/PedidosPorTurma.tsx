import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Download, Upload, Search, FileUp } from "lucide-react";

interface Class {
  id: string;
  name: string;
  level: string;
  materialList?: {
    items: MaterialItem[];
  };
}

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  description?: string;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  products: SupplierProduct[];
}

interface SupplierProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  unit: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  supplierName: string;
  totalValue: number;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function PedidosPorTurma() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("PEDAGOGICO");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const schoolId = "default-school"; // Ajustar conforme necessário
      
      const [classesRes, suppliersRes] = await Promise.all([
        fetch(`/api/material-orders/classes?schoolId=${schoolId}`),
        fetch(`/api/material-orders/suppliers?schoolId=${schoolId}`)
      ]);

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
      }

      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classId: string) => {
    setSelectedClass(classId);
    setCartItems([]);

    try {
      const res = await fetch(`/api/material-orders/classes/${classId}/materials`);
      if (res.ok) {
        const data = await res.json();
        setMaterialItems(data.items || []);
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
    }
  };

  const handleSupplierSelect = async (supplierId: string) => {
    setSelectedSupplier(supplierId);

    try {
      const res = await fetch(`/api/material-orders/suppliers/${supplierId}/products`);
      if (res.ok) {
        const products = await res.json();
        // Aqui você pode usar os produtos para preencher o carrinho
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedClass || !newItemName) return;

    try {
      const res = await fetch(`/api/material-orders/classes/${selectedClass}/materials/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          category: newItemCategory,
          quantity: newItemQuantity,
          unit: "un"
        })
      });

      if (res.ok) {
        setNewItemName("");
        setNewItemQuantity(1);
        handleClassSelect(selectedClass);
      }
    } catch (error) {
      console.error("Erro ao adicionar material:", error);
    }
  };

  const handleDeleteMaterial = async (itemId: string) => {
    try {
      const res = await fetch(`/api/material-orders/materials/items/${itemId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        handleClassSelect(selectedClass);
      }
    } catch (error) {
      console.error("Erro ao deletar material:", error);
    }
  };

  const handleAddToCart = (item: MaterialItem) => {
    const existing = cartItems.find((ci) => ci.id === item.id);
    if (existing) {
      setCartItems(
        cartItems.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, unitPrice: 0 }]);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(cartItems.filter((ci) => ci.id !== itemId));
  };

  const handleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSupplier) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", `Tabela ${new Date().toLocaleDateString()}`);

    try {
      const res = await fetch(`/api/material-orders/suppliers/${selectedSupplier}/import-prices`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        alert(`${data.message}`);
        handleSupplierSelect(selectedSupplier);
      }
    } catch (error) {
      console.error("Erro ao importar XML:", error);
      alert("Erro ao importar arquivo XML");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateOrder = async () => {
    if (!selectedClass || !selectedSupplier || cartItems.length === 0) {
      alert("Selecione turma, fornecedor e adicione itens ao carrinho");
      return;
    }

    try {
      const res = await fetch("/api/material-orders/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          schoolId: "default-school",
          supplierId: selectedSupplier,
          items: cartItems.map((item) => ({
            sku: item.sku || "",
            itemName: item.name,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            unit: item.unit
          }))
        })
      });

      if (res.ok) {
        const order = await res.json();
        alert("Pedido criado com sucesso!");
        setCartItems([]);
        // Atualizar lista de pedidos
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
    }
  };

  const handleDownloadSheet = async (orderId: string) => {
    try {
      const res = await fetch(`/api/material-orders/orders/${orderId}/generate-sheet`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Pedido_${Date.now()}.xlsx`;
        a.click();
      }
    } catch (error) {
      console.error("Erro ao download:", error);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos por Turma</h1>
        <p className="text-gray-500">Gerencie pedidos de materiais por turma</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna 1: Seleção de Turma e Materiais */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Turmas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {classes.map((cls) => (
              <Button
                key={cls.id}
                variant={selectedClass === cls.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleClassSelect(cls.id)}
              >
                {cls.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Coluna 2: Lista de Materiais */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Materiais da Turma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClass ? (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="Nome do material"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option>PEDAGOGICO</option>
                    <option>HIGIENE</option>
                    <option>ALIMENTACAO</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                  />
                  <Button onClick={handleAddMaterial} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {materialItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(item)}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMaterial(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">Selecione uma turma</p>
            )}
          </CardContent>
        </Card>

        {/* Coluna 3: Fornecedores e Carrinho */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fornecedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {suppliers.map((supplier) => (
                <Button
                  key={supplier.id}
                  variant={selectedSupplier === supplier.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSupplierSelect(supplier.id)}
                >
                  {supplier.name}
                </Button>
              ))}
            </div>

            {selectedSupplier && (
              <div className="space-y-2 border-t pt-4">
                <label className="block">
                  <div className="border-2 border-dashed rounded p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept=".xml"
                      onChange={handleXmlUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="text-center">
                      <FileUp className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                      <p className="text-xs font-medium">Importar Tabela XML</p>
                    </div>
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Carrinho de Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Carrinho de Compras</CardTitle>
          <CardDescription>{cartItems.length} itens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Carrinho vazio</p>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x R$ {(item.unitPrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleGenerateOrder} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar Pedido
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
