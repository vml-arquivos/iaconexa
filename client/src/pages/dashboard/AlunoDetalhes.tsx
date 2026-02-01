import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Trash2, Archive, Download, Upload, X, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  status: string;
  responsavelName?: string;
  responsavelEmail?: string;
  responsavelPhone?: string;
  healthData?: any;
  academicData?: any;
  attendance?: any;
  class?: { id: string; name: string };
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

export default function AlunoDetalhes() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [student, setStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        setEditData(data);
      }
    } catch (error) {
      console.error("Erro ao buscar aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        const updated = await res.json();
        setStudent(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleArchive = async () => {
    if (confirm("Arquivar este aluno?")) {
      try {
        const res = await fetch(`/api/students/${id}/archive`, {
          method: "PATCH"
        });

        if (res.ok) {
          navigate("/dashboard/alunos");
        }
      } catch (error) {
        console.error("Erro ao arquivar:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm("Deletar este aluno? Esta ação não pode ser desfeita.")) {
      try {
        const res = await fetch(`/api/students/${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          navigate("/dashboard/alunos");
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
      const res = await fetch(`/api/students/${id}/documents`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        fetchStudent();
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
        const res = await fetch(`/api/students/documents/${docId}`, {
          method: "DELETE"
        });

        if (res.ok) {
          fetchStudent();
        }
      } catch (error) {
        console.error("Erro ao deletar documento:", error);
      }
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!student) return <div className="p-8">Aluno não encontrado</div>;

  const statusColor = {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-yellow-500",
    EVADED: "bg-red-500",
    ARCHIVED: "bg-gray-500"
  };

  const attendance = student.attendance as any;
  const hasHighMisses = attendance?.faltasConsecutivas > 30;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/alunos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-gray-500">{student.class?.name || "Sem turma"}</p>
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

      {/* Status e Alertas */}
      <div className="flex gap-2">
        <Badge className={statusColor[student.status as keyof typeof statusColor]}>
          {student.status}
        </Badge>
        {hasHighMisses && (
          <Badge variant="destructive" className="bg-red-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Risco de Evasão
          </Badge>
        )}
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
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <Input
                    type="date"
                    value={editData.birthDate?.split("T")[0] || ""}
                    onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
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
              </div>
              <Button onClick={handleSave} className="w-full">
                Salvar Alterações
              </Button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{student.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{student.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">{student.birthDate ? formatDate(student.birthDate) : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Turma</p>
                <p className="font-medium">{student.class?.name || "-"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responsável */}
      <Card>
        <CardHeader>
          <CardTitle>Responsável</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="font-medium">{student.responsavelName || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{student.responsavelEmail || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telefone</p>
            <p className="font-medium">{student.responsavelPhone || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Frequência */}
      {attendance && (
        <Card>
          <CardHeader>
            <CardTitle>Frequência</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Faltas Consecutivas</p>
              <p className={`text-2xl font-bold ${hasHighMisses ? "text-red-500" : "text-green-500"}`}>
                {attendance.faltasConsecutivas || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Faltas</p>
              <p className="text-2xl font-bold">{attendance.total || 0}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saúde */}
      {student.healthData && (
        <Card>
          <CardHeader>
            <CardTitle>Informações de Saúde</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.healthData.alergias && (
              <div>
                <p className="text-sm text-gray-500">Alergias</p>
                <p className="font-medium">{student.healthData.alergias.join(", ")}</p>
              </div>
            )}
            {student.healthData.medicamentos && (
              <div>
                <p className="text-sm text-gray-500">Medicamentos</p>
                <p className="font-medium">{student.healthData.medicamentos.join(", ")}</p>
              </div>
            )}
            {student.healthData.tea && (
              <Badge className="bg-blue-500">TEA (Transtorno do Espectro Autista)</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Gerencie documentos do aluno</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="uploads" className="w-full">
            <TabsList>
              <TabsTrigger value="uploads">Fazer Upload</TabsTrigger>
              <TabsTrigger value="list">Documentos ({student.documents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="uploads" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {["RG", "CERTIDAO", "VACINA", "FOTO", "COMPROVANTE", "OUTRO"].map((type) => (
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
              {student.documents.length === 0 ? (
                <p className="text-gray-500">Nenhum documento</p>
              ) : (
                student.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-gray-500">{doc.filename}</p>
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
