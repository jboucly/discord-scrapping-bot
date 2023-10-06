-- CreateTable
CREATE TABLE "Daily" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "crontab" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,

    CONSTRAINT "Daily_pkey" PRIMARY KEY ("id")
);
