-- ========================================
-- ROLLBACK MIGRATION
-- feature_daily_log_agenda
-- ========================================
-- USO: Execute este script APENAS se precisar reverter a migration
-- ATENÇÃO: Isso irá APAGAR dados das novas colunas!
-- ========================================

-- 1. Remover Foreign Keys de Appointment
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_studentId_fkey";
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_unitId_fkey";

-- 2. Remover Índices de Appointment
DROP INDEX IF EXISTS "Appointment_status_idx";
DROP INDEX IF EXISTS "Appointment_studentId_idx";
DROP INDEX IF EXISTS "Appointment_unitId_scheduledAt_idx";

-- 3. Deletar Tabela Appointment
DROP TABLE IF EXISTS "Appointment";

-- 4. Remover Foreign Key de DailyLog
ALTER TABLE "DailyLog" DROP CONSTRAINT IF EXISTS "DailyLog_classId_fkey";

-- 5. Remover Índices de DailyLog
DROP INDEX IF EXISTS "DailyLog_classId_date_idx";
DROP INDEX IF EXISTS "DailyLog_studentId_date_idx";

-- 6. Remover Novas Colunas de DailyLog
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "updatedAt";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "alertTriggered";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "observations";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "mood";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "hygieneStatus";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "foodIntake";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "sleepStatus";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "classId";

-- 7. Restaurar Colunas Antigas de DailyLog (se necessário)
-- ATENÇÃO: Estas colunas serão criadas VAZIAS!
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "evacuation" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "foodAcceptance" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "sleepTime" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "sleep" TEXT;

-- 8. Deletar Enums
DROP TYPE IF EXISTS "ApptStatus";
DROP TYPE IF EXISTS "ApptType";
DROP TYPE IF EXISTS "Mood";
DROP TYPE IF EXISTS "HygieneStatus";
DROP TYPE IF EXISTS "FoodIntake";
DROP TYPE IF EXISTS "SleepStatus";

-- ========================================
-- ROLLBACK CONCLUÍDO
-- ========================================
-- PRÓXIMOS PASSOS:
-- 1. Reiniciar o servidor
-- 2. Executar: npx prisma generate
-- 3. Verificar se o sistema voltou ao normal
-- ========================================
