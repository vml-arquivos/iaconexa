-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('BERCARIO_I', 'BERCARIO_II', 'MATERNAL_I', 'MATERNAL_II');

-- CreateEnum
CREATE TYPE "BNCCField" AS ENUM ('O_EU_O_OUTRO_E_O_NOS', 'CORPO_GESTOS_E_MOVIMENTOS', 'TRACOS_SONS_CORES_E_FORMAS', 'ESCUTA_FALA_PENSAMENTO_E_IMAGINACAO', 'ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES');

-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO');

-- CreateTable
CREATE TABLE "LessonTemplate" (
    "id" TEXT NOT NULL,
    "month" "Month" NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "thematicAxis" TEXT NOT NULL,
    "segment" "Segment" NOT NULL,
    "bnccField" "BNCCField" NOT NULL,
    "date" TEXT,
    "weekContext" TEXT,
    "bnccCode" TEXT NOT NULL,
    "bnccObjective" TEXT NOT NULL,
    "curriculumObjective" TEXT NOT NULL,
    "pedagogicalIntent" TEXT NOT NULL,
    "activityExample" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonTemplate_month_segment_idx" ON "LessonTemplate"("month", "segment");

-- CreateIndex
CREATE INDEX "LessonTemplate_segment_bnccField_idx" ON "LessonTemplate"("segment", "bnccField");

-- CreateIndex
CREATE INDEX "LessonTemplate_thematicAxis_idx" ON "LessonTemplate"("thematicAxis");

-- CreateIndex
CREATE INDEX "LessonTemplate_weekNumber_idx" ON "LessonTemplate"("weekNumber");
