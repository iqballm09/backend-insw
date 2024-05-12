/*
  Warnings:

  - You are about to drop the column `id_depo` on the `td_do_kontainer_form` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_kontainer]` on the table `td_depo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_kontainer` to the `td_depo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "td_do_kontainer_form" DROP CONSTRAINT "td_do_kontainer_form_id_depo_fkey";

-- DropIndex
DROP INDEX "td_do_kontainer_form_id_depo_key";

-- AlterTable
ALTER TABLE "td_depo" ADD COLUMN     "id_kontainer" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "td_do_kontainer_form" DROP COLUMN "id_depo";

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateIndex
CREATE UNIQUE INDEX "td_depo_id_kontainer_key" ON "td_depo"("id_kontainer");

-- AddForeignKey
ALTER TABLE "td_depo" ADD CONSTRAINT "td_depo_id_kontainer_fkey" FOREIGN KEY ("id_kontainer") REFERENCES "td_do_kontainer_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
