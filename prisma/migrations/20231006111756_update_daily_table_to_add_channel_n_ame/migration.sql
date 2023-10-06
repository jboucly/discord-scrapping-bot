-- AlterTable
ALTER TABLE "Daily"
    ADD COLUMN "channelName" VARCHAR(255);

UPDATE
    "Daily"
SET
    "channelName" = 'Not complete'
WHERE
    "channelName" IS NULL;

ALTER TABLE "Daily"
    ALTER COLUMN "channelName" SET NOT NULL;

