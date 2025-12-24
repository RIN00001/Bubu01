/*
  Warnings:

  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_userId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "TransactionType" NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
