import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, Heart, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface Student {
  id: string;
  name: string;
  classId?: string;
  healthData?: {
    alergias?: string[];
    medicamentos?: string[];
    tea?: boolean;
  };
  attendance?: {
    faltasConsecutivas?: number;
    total?: number;
  };
}

export default function AlunosList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [alunos, setAlunos] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/students");
        if (!response.ok) throw new Error("Erro ao buscar alunos");
        const data = await response.json();
        setAlunos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredAlunos = alunos.filter(aluno =>
    aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.classId?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground mt-2">Gerencie todos os alunos do sistema</p>
        </div>
        <Link href="/dashboard/alunos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou turma..."
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlunos.map((aluno) => {
          const faltasConsecutivas = aluno.attendance?.faltasConsecutivas || 0;
          const faltasTotal = aluno.attendance?.total || 0;
          const isRiscoEvasao = faltasConsecutivas > 30;
          const temProblemasSaude = (aluno.healthData?.alergias?.length || 0) > 0 || 
                                     (aluno.healthData?.medicamentos?.length || 0) > 0;

          return (
            <Card
              key={aluno.id}
              className={`transition-all ${
                isRiscoEvasao
                  ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20"
                  : temProblemasSaude
                  ? "border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-950/20"
                  : ""
              }`}
              style={{
                borderWidth: isRiscoEvasao ? "2px" : "1px",
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {aluno.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{aluno.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {aluno.classId || "Sem turma"}
                      </CardDescription>
                    </div>
                  </div>
                  {isRiscoEvasao && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Risco
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Faltas Consecutivas</p>
                    <p className="font-semibold text-lg">{faltasConsecutivas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Faltas Totais</p>
                    <p className="font-semibold text-lg">{faltasTotal}</p>
                  </div>
                </div>

                {temProblemasSaude && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3 text-orange-500" />
                      Informações de Saúde
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {aluno.healthData?.alergias?.map((alergia, idx) => (
                        <Badge
                          key={`alergia-${idx}`}
                          variant="secondary"
                          className="bg-yellow-100/80 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs"
                        >
                          {alergia}
                        </Badge>
                      ))}
                      {aluno.healthData?.medicamentos?.map((med, idx) => (
                        <Badge
                          key={`med-${idx}`}
                          variant="secondary"
                          className="bg-orange-100/80 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 text-xs"
                        >
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {isRiscoEvasao && (
                  <div className="bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded p-2">
                    <p className="text-xs text-red-700 dark:text-red-200">
                      ⚠️ Aluno com risco de evasão. Recomenda-se contato com responsáveis.
                    </p>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlunos.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {alunos.length === 0 ? "Nenhum aluno cadastrado" : "Nenhum aluno encontrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
