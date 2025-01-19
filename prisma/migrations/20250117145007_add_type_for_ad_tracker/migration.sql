-- CreateEnum
CREATE TYPE "AdTrackerType" AS ENUM(
    'LBC',
    'OUEST_FRANCE_IMMO'
);

-- AlterTable
ALTER TABLE "AdTrackers"
    ADD COLUMN "type" "AdTrackerType";

UPDATE
    "AdTrackers"
SET
    "type" = 'LBC';

ALTER TABLE "AdTrackers"
    ALTER COLUMN "type" SET NOT NULL;

-- RenameIndex
ALTER INDEX "AdTracker_url_key" RENAME TO "AdTrackers_url_key";

