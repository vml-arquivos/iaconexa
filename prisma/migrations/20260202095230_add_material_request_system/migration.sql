-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('HIGIENE', 'LIMPEZA', 'ALIMENTACAO', 'PEDAGOGICO');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PURCHASED');

-- CreateTable
CREATE TABLE "MaterialRequest" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "MaterialCategory" NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaterialRequest_unitId_status_idx" ON "MaterialRequest"("unitId", "status");

-- CreateIndex
CREATE INDEX "MaterialRequest_userId_idx" ON "MaterialRequest"("userId");

-- CreateIndex
CREATE INDEX "MaterialRequest_status_idx" ON "MaterialRequest"("status");

-- CreateIndex
CREATE INDEX "MaterialRequest_requestedAt_idx" ON "MaterialRequest"("requestedAt");

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequest" ADD CONSTRAINT "MaterialRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
