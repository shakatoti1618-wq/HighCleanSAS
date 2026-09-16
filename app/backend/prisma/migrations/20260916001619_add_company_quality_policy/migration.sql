/*
  Warnings:

  - The `values` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "qualityPolicy" TEXT,
DROP COLUMN "values",
ADD COLUMN     "values" JSONB;
