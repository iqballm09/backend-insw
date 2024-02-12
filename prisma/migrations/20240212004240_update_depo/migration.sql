/*
  Warnings:

  - You are about to drop the column `td_do_kontainer_formId` on the `td_depo` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `td_depo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "td_depo" DROP CONSTRAINT "td_depo_td_do_kontainer_formId_fkey";

-- DropIndex
DROP INDEX "td_depo_td_do_kontainer_formId_key";

-- AlterTable
ALTER TABLE "td_depo" DROP COLUMN "td_do_kontainer_formId",
ADD COLUMN     "created_by" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "td_do_kontainer_form" ADD COLUMN     "td_depoId" INTEGER;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- AddForeignKey
ALTER TABLE "td_do_kontainer_form" ADD CONSTRAINT "td_do_kontainer_form_td_depoId_fkey" FOREIGN KEY ("td_depoId") REFERENCES "td_depo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td_depo" ADD CONSTRAINT "td_depo_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("name") ON DELETE CASCADE ON UPDATE CASCADE;
