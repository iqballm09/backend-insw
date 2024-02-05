/*
  Warnings:

  - The values [Approved] on the enum `StatusDo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusDo_new" AS ENUM ('Draft', 'Submitted', 'Checking', 'Released', 'Rejected');
ALTER TABLE "td_reqdo_status" ALTER COLUMN "name" TYPE "StatusDo_new" USING ("name"::text::"StatusDo_new");
ALTER TYPE "StatusDo" RENAME TO "StatusDo_old";
ALTER TYPE "StatusDo_new" RENAME TO "StatusDo";
DROP TYPE "StatusDo_old";
COMMIT;

-- AlterTable
ALTER TABLE "td_reqdo_header_form" ALTER COLUMN "no_reqdo" SET DEFAULT CONCAT('LNSW', EXTRACT(EPOCH FROM NOW())::Int)::text;

-- CreateTable
CREATE TABLE "td_depo" (
    "id" SERIAL NOT NULL,
    "id_kabkota" INTEGER NOT NULL,
    "kode_depo" VARCHAR(30) NOT NULL,
    "npwp" VARCHAR(15) NOT NULL,
    "deskripsi" VARCHAR(255) NOT NULL,
    "alamat" VARCHAR(1025) NOT NULL,
    "kode_pos" VARCHAR(5) NOT NULL,
    "no_telp" VARCHAR(20) NOT NULL,
    "td_do_kontainer_formId" INTEGER,

    CONSTRAINT "td_depo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "td_depo_td_do_kontainer_formId_key" ON "td_depo"("td_do_kontainer_formId");

-- AddForeignKey
ALTER TABLE "td_depo" ADD CONSTRAINT "td_depo_td_do_kontainer_formId_fkey" FOREIGN KEY ("td_do_kontainer_formId") REFERENCES "td_do_kontainer_form"("id") ON DELETE SET NULL ON UPDATE CASCADE;
