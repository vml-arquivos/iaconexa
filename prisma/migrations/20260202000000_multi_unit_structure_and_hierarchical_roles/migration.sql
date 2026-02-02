-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('MATRIZ', 'UNIDADE');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('MATRIZ_ADMIN', 'COORDENADOR_GERAL', 'DIRETOR_UNIDADE', 'COORDENADOR_PEDAGOGICO', 'PROFESSOR', 'NUTRICIONISTA', 'PSICOLOGO', 'SECRETARIO');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
-- Fix: Mapeamento seguro de roles antigas para novas (evita crash)
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE 
    WHEN "role"::text = 'MATRIZ_NUTRI' THEN 'NUTRICIONISTA'::text
    WHEN "role"::text = 'MATRIZ_ADMIN' THEN 'MATRIZ_ADMIN'::text
    WHEN "role"::text = 'SECRETARIO' THEN 'SECRETARIO'::text
    WHEN "role"::text = 'COORDENADOR_GERAL' THEN 'COORDENADOR_GERAL'::text
    ELSE "role"::text
  END
)::"UserRole_new";

ALTER TABLE "Employee" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE 
    WHEN "role"::text = 'MATRIZ_NUTRI' THEN 'NUTRICIONISTA'::text
    WHEN "role"::text = 'MATRIZ_ADMIN' THEN 'MATRIZ_ADMIN'::text
    WHEN "role"::text = 'SECRETARIO' THEN 'SECRETARIO'::text
    WHEN "role"::text = 'COORDENADOR_GERAL' THEN 'COORDENADOR_GERAL'::text
    ELSE "role"::text
  END
)::"UserRole_new";
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'PROFESSOR';
COMMIT;

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "type" "UnitType" NOT NULL DEFAULT 'UNIDADE',
    "associationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_code_key" ON "Unit"("code");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "unitId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "unitId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
