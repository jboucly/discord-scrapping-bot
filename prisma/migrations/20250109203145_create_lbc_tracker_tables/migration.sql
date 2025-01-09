-- CreateTable
CREATE TABLE "LbcTracker" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,

    CONSTRAINT "LbcTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatyAdLbcTracker" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "url" VARCHAR(255),
    "title" VARCHAR(255),
    "price" VARCHAR(50),
    "pricePerM2" VARCHAR(50),
    "imageUrl" VARCHAR(255),
    "location" VARCHAR(255),
    "lbcTrackerId" INTEGER NOT NULL,

    CONSTRAINT "TreatyAdLbcTracker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LbcTracker_url_key" ON "LbcTracker"("url");

-- AddForeignKey
ALTER TABLE "TreatyAdLbcTracker" ADD CONSTRAINT "TreatyAdLbcTracker_lbcTrackerId_fkey" FOREIGN KEY ("lbcTrackerId") REFERENCES "LbcTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
