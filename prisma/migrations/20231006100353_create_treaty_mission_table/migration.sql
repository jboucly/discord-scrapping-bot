-- CreateTable
CREATE TABLE "TreatyMission" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "missionId" INTEGER NOT NULL,
    "missionTreatyId" INTEGER NOT NULL,
    "url" VARCHAR(255),
    "name" VARCHAR(255),

    CONSTRAINT "TreatyMission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TreatyMission" ADD CONSTRAINT "TreatyMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Missions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
