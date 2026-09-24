-- CreateEnum
CREATE TYPE "GalleryType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "type" "GalleryType" NOT NULL DEFAULT 'IMAGE';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "imageUrl" TEXT;
