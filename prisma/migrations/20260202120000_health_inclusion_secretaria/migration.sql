-- Migration: Health Profiles and Student Observations (Secretaria 360º)
-- Created: 2026-02-02
-- Description: Add StudentHealthProfile and StudentObservation models for health tracking and inclusion support

-- Create ObservationType enum
CREATE TYPE "ObservationType" AS ENUM ('BEHAVIORAL', 'LEARNING', 'PHYSICAL', 'SOCIAL');

-- Create StudentHealthProfile table
CREATE TABLE "StudentHealthProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "bloodType" TEXT,
    "hasAllergy" BOOLEAN NOT NULL DEFAULT false,
    "allergyDetails" TEXT,
    "dietaryRestrictions" TEXT,
    "hasSpecialNeeds" BOOLEAN NOT NULL DEFAULT false,
    "medicalReport" TEXT,
    "medications" TEXT,
    "emergencyContact" TEXT,
    "susNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentHealthProfile_pkey" PRIMARY KEY ("id")
);

-- Create StudentObservation table
CREATE TABLE "StudentObservation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ObservationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentObservation_pkey" PRIMARY KEY ("id")
);

-- Create unique index on StudentHealthProfile.studentId
CREATE UNIQUE INDEX "StudentHealthProfile_studentId_key" ON "StudentHealthProfile"("studentId");

-- Create indexes for StudentHealthProfile
CREATE INDEX "StudentHealthProfile_studentId_idx" ON "StudentHealthProfile"("studentId");
CREATE INDEX "StudentHealthProfile_hasAllergy_idx" ON "StudentHealthProfile"("hasAllergy");
CREATE INDEX "StudentHealthProfile_hasSpecialNeeds_idx" ON "StudentHealthProfile"("hasSpecialNeeds");

-- Create indexes for StudentObservation
CREATE INDEX "StudentObservation_studentId_date_idx" ON "StudentObservation"("studentId", "date");
CREATE INDEX "StudentObservation_authorId_idx" ON "StudentObservation"("authorId");
CREATE INDEX "StudentObservation_type_idx" ON "StudentObservation"("type");
CREATE INDEX "StudentObservation_isPrivate_idx" ON "StudentObservation"("isPrivate");

-- Add foreign key constraints
ALTER TABLE "StudentHealthProfile" ADD CONSTRAINT "StudentHealthProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentObservation" ADD CONSTRAINT "StudentObservation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentObservation" ADD CONSTRAINT "StudentObservation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
