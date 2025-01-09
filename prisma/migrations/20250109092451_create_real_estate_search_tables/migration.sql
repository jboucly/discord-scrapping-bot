-- CreateTable
CREATE TABLE "RealEstate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,

    CONSTRAINT "RealEstate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatyRealEstate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "url" VARCHAR(255),
    "title" VARCHAR(255),
    "description" TEXT,
    "price" VARCHAR(50),
    "pricePerM2" VARCHAR(50),
    "imageUrl" VARCHAR(255),
    "location" VARCHAR(255),
    "realEstateId" VARCHAR(255) NOT NULL,

    CONSTRAINT "TreatyRealEstate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RealEstate_url_key" ON "RealEstate"("url");

-- AddForeignKey
ALTER TABLE "TreatyRealEstate" ADD CONSTRAINT "TreatyRealEstate_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("url") ON DELETE CASCADE ON UPDATE CASCADE;
