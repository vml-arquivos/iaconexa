-- Migration: Update UserRole enum with strict hierarchical structure
-- Date: 2026-02-02
-- Purpose: Implement RBAC with "Matriz Audita, Unidade Executa" logic

-- Drop old enum values and create new structure
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

CREATE TYPE "UserRole" AS ENUM (
  'ADMIN_MATRIZ',
  'GESTOR_REDE',
  'DIRETOR_UNIDADE',
  'COORD_PEDAGOGICO',
  'SECRETARIA',
  'NUTRICIONISTA',
  'PROFESSOR'
);

-- Migrate existing data with role mapping
-- Old -> New mappings:
-- MATRIZ_ADMIN -> ADMIN_MATRIZ
-- COORDENADOR_GERAL -> GESTOR_REDE
-- DIRETOR_UNIDADE -> DIRETOR_UNIDADE (unchanged)
-- COORDENADOR_PEDAGOGICO -> COORD_PEDAGOGICO
-- SECRETARIO -> SECRETARIA
-- NUTRICIONISTA -> NUTRICIONISTA (unchanged)
-- PROFESSOR -> PROFESSOR (unchanged)
-- PSICOLOGO -> NUTRICIONISTA (merged into health services)

ALTER TABLE "User" 
  ALTER COLUMN "role" TYPE "UserRole" 
  USING (
    CASE 
      WHEN "role"::text = 'MATRIZ_ADMIN' THEN 'ADMIN_MATRIZ'::text
      WHEN "role"::text = 'COORDENADOR_GERAL' THEN 'GESTOR_REDE'::text
      WHEN "role"::text = 'DIRETOR_UNIDADE' THEN 'DIRETOR_UNIDADE'::text
      WHEN "role"::text = 'COORDENADOR_PEDAGOGICO' THEN 'COORD_PEDAGOGICO'::text
      WHEN "role"::text = 'SECRETARIO' THEN 'SECRETARIA'::text
      WHEN "role"::text = 'NUTRICIONISTA' THEN 'NUTRICIONISTA'::text
      WHEN "role"::text = 'PROFESSOR' THEN 'PROFESSOR'::text
      WHEN "role"::text = 'PSICOLOGO' THEN 'NUTRICIONISTA'::text
      ELSE 'PROFESSOR'::text
    END::"UserRole"
  );

DROP TYPE "UserRole_old";

-- Add comment for documentation
COMMENT ON TYPE "UserRole" IS 'Hierarchical RBAC: Estratégico (View-Only Global), Tático (Local Authority), Operacional (Execution)';
