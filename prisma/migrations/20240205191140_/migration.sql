/*
  Warnings:

  - A unique constraint covering the columns `[no_seal]` on the table `td_do_kontainer_seal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateIndex
CREATE UNIQUE INDEX "td_do_kontainer_seal_no_seal_key" ON "td_do_kontainer_seal"("no_seal");
