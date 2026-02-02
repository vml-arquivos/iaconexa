-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('WEEKLY_UNIT', 'MONTHLY_GENERAL', 'EXTRAORDINARY');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('SUGGESTED', 'APPROVED', 'DISCUSSED', 'DEFERRED');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "unitId" TEXT,
    "hostId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "MeetingType" NOT NULL,
    "title" TEXT NOT NULL,
    "minutes" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingTopic" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "suggesterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TopicStatus" NOT NULL DEFAULT 'SUGGESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MeetingAttendees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MeetingAttendees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Meeting_unitId_date_idx" ON "Meeting"("unitId", "date");

-- CreateIndex
CREATE INDEX "Meeting_hostId_idx" ON "Meeting"("hostId");

-- CreateIndex
CREATE INDEX "Meeting_type_idx" ON "Meeting"("type");

-- CreateIndex
CREATE INDEX "Meeting_isClosed_idx" ON "Meeting"("isClosed");

-- CreateIndex
CREATE INDEX "MeetingTopic_meetingId_idx" ON "MeetingTopic"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingTopic_suggesterId_idx" ON "MeetingTopic"("suggesterId");

-- CreateIndex
CREATE INDEX "MeetingTopic_status_idx" ON "MeetingTopic"("status");

-- CreateIndex
CREATE INDEX "ActionItem_meetingId_idx" ON "ActionItem"("meetingId");

-- CreateIndex
CREATE INDEX "ActionItem_assigneeId_idx" ON "ActionItem"("assigneeId");

-- CreateIndex
CREATE INDEX "ActionItem_isCompleted_idx" ON "ActionItem"("isCompleted");

-- CreateIndex
CREATE INDEX "ActionItem_dueDate_idx" ON "ActionItem"("dueDate");

-- CreateIndex
CREATE INDEX "_MeetingAttendees_B_index" ON "_MeetingAttendees"("B");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTopic" ADD CONSTRAINT "MeetingTopic_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTopic" ADD CONSTRAINT "MeetingTopic_suggesterId_fkey" FOREIGN KEY ("suggesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MeetingAttendees" ADD CONSTRAINT "_MeetingAttendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MeetingAttendees" ADD CONSTRAINT "_MeetingAttendees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
