-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN     "extraPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "includedSelect" INTEGER NOT NULL DEFAULT 0;
