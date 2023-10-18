DELETE FROM "Missions";

-- AlterTable
ALTER TABLE "Missions"
    ADD COLUMN "userId" TEXT NOT NULL;

