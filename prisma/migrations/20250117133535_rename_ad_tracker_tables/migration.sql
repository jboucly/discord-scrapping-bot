-- DropForeignKey
ALTER TABLE "TreatyAdLbcTracker"
    DROP CONSTRAINT "TreatyAdLbcTracker_lbcTrackerId_fkey";

-- RenameTable
ALTER TABLE "LbcTracker" RENAME TO "AdTrackers";

-- RenameTable
ALTER TABLE "TreatyAdLbcTracker" RENAME TO "TreatyAdTracker";

-- RenameConstraint
ALTER TABLE "AdTrackers" RENAME CONSTRAINT "LbcTracker_pkey" TO "AdTrackers_pkey";

-- RenameConstraint
ALTER TABLE "TreatyAdTracker" RENAME CONSTRAINT "TreatyAdLbcTracker_pkey" TO "TreatyAdTracker_pkey";

-- RenameColumn
ALTER TABLE "TreatyAdTracker" RENAME COLUMN "lbcTrackerId" TO "adTrackerId";

-- AddForeignKey
ALTER TABLE "TreatyAdTracker"
    ADD CONSTRAINT "TreatyAdTracker_adTrackerId_fkey" FOREIGN KEY ("adTrackerId") REFERENCES "AdTrackers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- INDEX
DROP INDEX "LbcTracker_url_key";

CREATE UNIQUE INDEX "AdTracker_url_key" ON "AdTrackers"("url");

