-- DropForeignKey
ALTER TABLE "TreatyMission"
    DROP CONSTRAINT "TreatyMission_missionId_fkey";

-- AddForeignKey
ALTER TABLE "TreatyMission"
    ADD CONSTRAINT "TreatyMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

