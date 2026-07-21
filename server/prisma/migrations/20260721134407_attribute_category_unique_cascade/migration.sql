-- CreateEnum
CREATE TYPE "AttributeCategory" AS ENUM ('CERTIFICATION', 'DOMAIN_KNOWLEDGE', 'PERSONAL_INFORMATION', 'SOFT_SKILLS');

-- DropForeignKey
ALTER TABLE "ProfileValue" DROP CONSTRAINT "ProfileValue_attributeId_fkey";

-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "category" "AttributeCategory" NOT NULL DEFAULT 'PERSONAL_INFORMATION';

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");

-- AddForeignKey
ALTER TABLE "ProfileValue" ADD CONSTRAINT "ProfileValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;