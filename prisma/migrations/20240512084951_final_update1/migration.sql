/*
  Warnings:

  - You are about to drop the column `td_depoId` on the `td_do_kontainer_form` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_depo]` on the table `td_do_kontainer_form` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "td_do_kontainer_form" DROP CONSTRAINT "td_do_kontainer_form_td_depoId_fkey";

-- AlterTable
ALTER TABLE "td_do_kontainer_form" DROP COLUMN "td_depoId";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateIndex
CREATE UNIQUE INDEX "td_do_kontainer_form_id_depo_key" ON "td_do_kontainer_form"("id_depo");

-- AddForeignKey
ALTER TABLE "td_do_kontainer_form" ADD CONSTRAINT "td_do_kontainer_form_id_depo_fkey" FOREIGN KEY ("id_depo") REFERENCES "td_depo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
