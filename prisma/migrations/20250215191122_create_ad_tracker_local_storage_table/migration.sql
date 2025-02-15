-- AlterEnum
ALTER TYPE "AdTrackerType" ADD VALUE 'MOTEUR_IMMO';

-- CreateTable
CREATE TABLE "AdTrackerLocalStorage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "adTrackerId" INTEGER NOT NULL,

    CONSTRAINT "AdTrackerLocalStorage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdTrackerLocalStorage_adTrackerId_key" ON "AdTrackerLocalStorage"("adTrackerId");

-- AddForeignKey
ALTER TABLE "AdTrackerLocalStorage" ADD CONSTRAINT "AdTrackerLocalStorage_adTrackerId_fkey" FOREIGN KEY ("adTrackerId") REFERENCES "AdTrackers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
