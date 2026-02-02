-- CreateEnum
CREATE TYPE "SleepStatus" AS ENUM ('SLEEPING', 'AWAKE', 'NAP_TIME');

-- CreateEnum
CREATE TYPE "FoodIntake" AS ENUM ('FULL_MEAL', 'PARTIAL', 'REJECTED', 'NA');

-- CreateEnum
CREATE TYPE "HygieneStatus" AS ENUM ('CLEAN', 'DIAPER_CHANGE', 'BATH', 'SOILED');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('HAPPY', 'CRYING', 'AGITATED', 'CALM');

-- CreateEnum
CREATE TYPE "ApptType" AS ENUM ('PARENT_MEETING', 'INTERNAL_COORD', 'HEALTH_CHECK');

-- CreateEnum
CREATE TYPE "ApptStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED');

-- AlterTable DailyLog: Drop old columns and add new structure
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "sleep";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "sleepTime";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "foodAcceptance";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "evacuation";
ALTER TABLE "DailyLog" DROP COLUMN IF EXISTS "notes";

-- AlterTable DailyLog: Add new columns
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "classId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "sleepStatus" "SleepStatus";
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "foodIntake" "FoodIntake";
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "hygieneStatus" "HygieneStatus";
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "mood" "Mood";
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "observations" TEXT;
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "alertTriggered" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "DailyLog" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyLog_studentId_date_idx" ON "DailyLog"("studentId", "date");
CREATE INDEX IF NOT EXISTS "DailyLog_classId_date_idx" ON "DailyLog"("classId", "date");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable Appointment
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "studentId" TEXT,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "type" "ApptType" NOT NULL,
    "status" "ApptStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingMinutes" TEXT,
    "attendees" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_unitId_scheduledAt_idx" ON "Appointment"("unitId", "scheduledAt");
CREATE INDEX "Appointment_studentId_idx" ON "Appointment"("studentId");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
