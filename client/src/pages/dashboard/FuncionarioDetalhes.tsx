import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Trash2, Archive, Download, Upload, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  category: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status: string;
  hireDate?: string;
  salary?: number;
  department?: string;
  personalData?: any;
  documents: Document[];
}

interface Document {
  id: string;
  type: string;
  filename: string;
  url: string;
  createdAt: string;
  expiryDate?: string;
}

export default function FuncionarioDetalhes() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data);
        setEditData(data);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        const updated = await res.json();
        setEmployee(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleArchive = async () => {
    if (confirm("Arquivar este funcionário?")) {
      try {
        const res = await fetch(`/api/employees/${id}/archive`, {
          method: "PATCH"
        });

        if (res.ok) {
          navigate("/dashboard/funcionarios");
        }
      } catch (error) {
        console.error("Erro ao arquivar:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm("Deletar este funcionário? Esta ação não pode ser desfeita.")) {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          navigate("/dashboard/funcionarios");
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", (e.target as any).dataset.type);

    try {
      const res = await fetch(`/api/employees/${id}/documents`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        fetchEmployee();
      }
    } catch (error) {
      console.error("Erro ao upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm("Deletar documento?")) {
      try {
        const res = await fetch(`/api/employees/documents/${docId}`, {
          method: "DELETE"
        });

        if (res.ok) {
          fetchEmployee();
        }
      } catch (error) {
        console.error("Erro ao deletar documento:", error);
      }
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!employee) return <div className="p-8">Funcionário não encontrado</div>;

  const statusColor = {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-yellow-500",
    ARCHIVED: "bg-gray-500"
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/funcionarios")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <p className="text-gray-500">{employee.category}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
          <Button variant="outline" onClick={handleArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Arquivar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-2">
        <Badge className={statusColor[employee.status as keyof typeof statusColor]}>
          {employee.status}
        </Badge>
      </div>

      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Input
                    value={editData.category || ""}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={editData.phone || ""}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CPF</label>
                  <Input
                    value={editData.cpf || ""}
                    onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Departamento</label>
                  <Input
                    value={editData.department || ""}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                Salvar Alterações
              </Button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{employee.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{employee.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CPF</p>
                <p className="font-medium">{employee.cpf || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Departamento</p>
                <p className="font-medium">{employee.department || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Contratação</p>
                <p className="font-medium">{employee.hireDate ? formatDate(employee.hireDate) : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salário</p>
                <p className="font-medium">
                  {employee.salary ? `R$ ${employee.salary.toFixed(2)}` : "-"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Gerencie documentos do funcionário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="uploads" className="w-full">
            <TabsList>
              <TabsTrigger value="uploads">Fazer Upload</TabsTrigger>
              <TabsTrigger value="list">Documentos ({employee.documents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="uploads" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {["RG", "CONTRATO", "FOTO", "DIPLOMA", "CERTIFICADO", "ATESTADO"].map((type) => (
                  <label key={type} className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleDocumentUpload}
                      data-type={type}
                      disabled={uploading}
                    />
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">{type}</p>
                      <p className="text-xs text-gray-500">Clique para upload</p>
                    </div>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-2">
              {employee.documents.length === 0 ? (
                <p className="text-gray-500">Nenhum documento</p>
              ) : (
                employee.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-gray-500">{doc.filename}</p>
                      {doc.expiryDate && (
                        <p className="text-xs text-orange-500">Vence: {formatDate(doc.expiryDate)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
