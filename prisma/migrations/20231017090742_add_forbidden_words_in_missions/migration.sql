-- AlterTable
ALTER TABLE "Missions" ADD COLUMN     "forbiddenWords" TEXT[] DEFAULT ARRAY[]::TEXT[];
