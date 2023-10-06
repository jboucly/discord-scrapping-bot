-- CreateTable
CREATE TABLE "Missions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "words" TEXT[],

    CONSTRAINT "Missions_pkey" PRIMARY KEY ("id")
);
