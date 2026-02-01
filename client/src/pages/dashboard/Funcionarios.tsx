import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Trash2, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Employee {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  status: string;
  documents: Document[];
  createdAt: string;
}

interface Document {
  id: string;
  type: string;
  filename: string;
  url: string;
  createdAt: string;
}

export default function Funcionarios() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "Professor",
    email: "",
    phone: "",
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const roles = ["Professor", "Nutricionista", "Zelador", "Coordenador", "Administrativo"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Erro ao buscar funcionários");
      const data = await response.json();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      if (!newEmployee.name || !newEmployee.role) {
        alert("Preenchaa nome e função");
        return;
      }

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEmployee,
          schoolId: "default-school",
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar funcionário");
      await fetchEmployees();
      setNewEmployee({ name: "", role: "Professor", email: "", phone: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar funcionário");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, employeeId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "DOCUMENTO");
      formData.append("employeeId", employeeId);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao fazer upload");
      await fetchEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Tem certeza que deseja deletar este documento?")) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar documento");
      await fetchEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground mt-2">Gerencie funcionários e seus documentos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Funcionário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome completo"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Email (opcional)"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
              <Input
                placeholder="Telefone (opcional)"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              />
              <Button onClick={handleCreateEmployee} className="w-full">
                Criar Funcionário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Input
          placeholder="Buscar por nome ou função..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <p className="text-red-700">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <CardDescription>{employee.role}</CardDescription>
                </div>
                <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>
                  {employee.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {employee.email && (
                <p className="text-sm text-muted-foreground">📧 {employee.email}</p>
              )}
              {employee.phone && (
                <p className="text-sm text-muted-foreground">📱 {employee.phone}</p>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos ({employee.documents.length})
                </p>

                <div className="space-y-2">
                  {employee.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-muted p-2 rounded">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {doc.filename}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <label className="mt-3 flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm text-primary hover:underline">
                    {uploading ? "Enviando..." : "Adicionar Documento"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, employee.id)}
                    disabled={uploading}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {employees.length === 0 ? "Nenhum funcionário cadastrado" : "Nenhum funcionário encontrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
